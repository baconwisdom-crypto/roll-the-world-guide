import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const requestedRoot = process.argv[2];
const sourceRoot = requestedRoot
  ? path.resolve(projectRoot, requestedRoot)
  : path.join(projectRoot, "research", "video", "sources");

function timestamp(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
}

if (!fs.existsSync(sourceRoot)) {
  console.error(`Video source directory does not exist: ${sourceRoot}`);
  console.error("Create research/video/sources/<source-id>/ and place original JSON3 caption files inside it.");
  process.exit(1);
}

const sourceDirectories = fs
  .readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

let transcriptCount = 0;

for (const sourceId of sourceDirectories) {
  const sourceDir = path.join(sourceRoot, sourceId);
  const subtitle = fs.readdirSync(sourceDir).find((name) => name.endsWith(".json3"));
  if (!subtitle) continue;

  const payload = JSON.parse(fs.readFileSync(path.join(sourceDir, subtitle), "utf8"));
  const cues = (payload.events ?? [])
    .filter((event) => Array.isArray(event.segs))
    .map((event) => ({
      start: event.tStartMs / 1000,
      end: (event.tStartMs + (event.dDurationMs ?? 0)) / 1000,
      text: event.segs.map((segment) => segment.utf8 ?? "").join("").replace(/\s+/g, " ").trim(),
    }))
    .filter((cue) => cue.text && cue.text !== "[Music]");

  const lines = [
    `# Cleaned original-language transcript: ${sourceId}`,
    "",
    `Source subtitle: \`${subtitle}\``,
    "",
    ...cues.map((cue) => `[${timestamp(cue.start)} to ${timestamp(cue.end)}] ${cue.text}`),
    "",
  ];

  fs.writeFileSync(path.join(sourceDir, `${sourceId}.cleaned-transcript.md`), lines.join("\n"), "utf8");
  transcriptCount += 1;
  process.stdout.write(`${sourceId}: ${cues.length} cues\n`);
}

if (transcriptCount === 0) {
  console.error(`No JSON3 caption files were found under ${sourceRoot}`);
  process.exit(1);
}

console.log(`Built ${transcriptCount} cleaned transcript file(s).`);
