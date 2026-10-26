import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { BRAND_ICON_OUTPUTS, readSiteConfigContract } from "./framework-contract.mjs";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const publicRoot = resolve(root, "public");
const config = readSiteConfigContract(join(root, "config", "site.ts"));
const args = process.argv.slice(2);

function readOption(name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a local source path`);
  return value;
}

const sourceArg = readOption("--source");
const unknownArgs = args.filter((arg, index) => arg.startsWith("--") && arg !== "--source" || index > 0 && args[index - 1] === "--source");
if (unknownArgs.some((arg) => arg.startsWith("--") && arg !== "--source")) {
  throw new Error(`unknown option: ${unknownArgs.find((arg) => arg.startsWith("--") && arg !== "--source")}`);
}

function resolveLocalSource(source) {
  if (!source || /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(source)) {
    throw new Error("brand icon generation accepts a local file only; remote URLs are not allowed");
  }
  const candidate = source.startsWith("/")
    ? resolve(publicRoot, `.${source}`)
    : resolve(root, source);
  const relativePath = relative(root, candidate);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error(`source must stay inside the framework project: ${source}`);
  }
  return candidate;
}

function assertPublicTarget(filePath, label) {
  const relativePath = relative(publicRoot, filePath);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error(`${label} escaped the exact public output directory`);
  }
}

function createIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(frames.length * 16);
  let dataOffset = header.length + directory.length;
  const payloads = [];
  frames.forEach((frame, index) => {
    const offset = index * 16;
    directory[offset] = frame.size === 256 ? 0 : frame.size;
    directory[offset + 1] = frame.size === 256 ? 0 : frame.size;
    directory[offset + 2] = 0;
    directory[offset + 3] = 0;
    directory.writeUInt16LE(1, offset + 4);
    directory.writeUInt16LE(32, offset + 6);
    directory.writeUInt32LE(frame.data.length, offset + 8);
    directory.writeUInt32LE(dataOffset, offset + 12);
    payloads.push(frame.data);
    dataOffset += frame.data.length;
  });
  return Buffer.concat([header, directory, ...payloads]);
}

async function renderPng(sourcePath, size) {
  return sharp(sourcePath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  const sourcePath = resolveLocalSource(sourceArg ?? config.brandIcon?.src);
  const outputPaths = BRAND_ICON_OUTPUTS.map((output) => ({
    ...output,
    filePath: resolve(root, output.relativePath),
  }));
  for (const output of outputPaths) assertPublicTarget(output.filePath, output.relativePath);
  if (outputPaths.some((output) => resolve(output.filePath) === resolve(sourcePath))) {
    throw new Error("source icon cannot be one of the generated output targets");
  }
  if (!existsSync(sourcePath)) throw new Error(`brand icon source file does not exist: ${sourcePath}`);

  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`could not read brand icon dimensions: ${sourcePath}`);
  if (metadata.width !== metadata.height) throw new Error(`brand icon source must be square: ${sourcePath} (${metadata.width}x${metadata.height})`);
  if (metadata.width < 192) console.warn(`WARN source icon is smaller than 192px: ${metadata.width}x${metadata.height}`);

  const icon192 = await renderPng(sourcePath, 192);
  const appleTouch = await renderPng(sourcePath, 180);
  const favicon16 = await renderPng(sourcePath, 16);
  const favicon32 = await renderPng(sourcePath, 32);
  const generated = new Map([
    ["favicon", createIco([{ size: 16, data: favicon16 }, { size: 32, data: favicon32 }])],
    ["icon192", icon192],
    ["appleTouch", appleTouch],
  ]);

  await mkdir(publicRoot, { recursive: true });
  const stagingDir = resolve(publicRoot, `.brand-icons-staging-${process.pid}`);
  await rm(stagingDir, { recursive: true, force: true });
  await mkdir(stagingDir, { recursive: true });
  try {
    for (const output of outputPaths) {
      const data = generated.get(output.key);
      if (!data) throw new Error(`missing generated buffer for ${output.key}`);
      await writeFile(join(stagingDir, output.filePath.split(/[\\/]/).pop()), data);
    }
    for (const output of outputPaths) {
      const staged = join(stagingDir, output.filePath.split(/[\\/]/).pop());
      await rm(output.filePath, { force: true });
      await rename(staged, output.filePath);
    }
  } finally {
    await rm(stagingDir, { recursive: true, force: true });
  }

  console.log(`Generated brand icon assets from ${sourcePath}`);
  for (const output of outputPaths) console.log(`  ${output.relativePath}`);
}

main().catch((error) => {
  console.error(`Brand icon generation failed: ${error.message}`);
  process.exitCode = 1;
});
