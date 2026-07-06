import { readdirSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  ".turbo",
  "vendor",
  "target",
  ".venv",
  "__pycache__",
]);

/**
 * Recursively walk a directory, yielding absolute file paths.
 * Skips common build/dependency directories.
 */
export function* walkFiles(dir, { ignore = IGNORED_DIRS } = {}) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignore.has(entry.name)) continue;
      yield* walkFiles(full, { ignore });
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

/** Collect every *.spec.md file under the given roots. */
export function findSpecs(roots) {
  const found = [];
  const seen = new Set();
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const st = statSync(root);
    if (st.isFile()) {
      if (root.endsWith(".spec.md") && !seen.has(root)) {
        seen.add(root);
        found.push(root);
      }
      continue;
    }
    for (const file of walkFiles(root)) {
      if (file.endsWith(".spec.md") && !seen.has(file)) {
        seen.add(file);
        found.push(file);
      }
    }
  }
  return found.sort();
}

/** Expand a path (file or dir) into the list of files it covers. */
export function expandPath(p) {
  if (!existsSync(p)) return [];
  const st = statSync(p);
  if (st.isFile()) return [p];
  return [...walkFiles(p)];
}

export { basename };
