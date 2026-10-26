import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const walk = (dir) => {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const relative = join(dir, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (/\.(ts|tsx|mjs|json)$/.test(entry.name)) {
      const raw = readFileSync(join(root, relative), "utf8");
      if (/Zero Company|Star Wars Zero Company|Lucasfilm/i.test(raw)) failures.push(`${relative}: source-specific copy`);
      if (/lorem ipsum|placeholder text/i.test(raw)) failures.push(`${relative}: placeholder copy`);
    }
  }
};
for (const dir of ["app", "components", "config", "content", "lib"]) walk(dir);
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("Lint check passed: no source-specific or placeholder copy detected.");
