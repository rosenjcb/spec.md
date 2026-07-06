#!/usr/bin/env node
/**
 * Single-source packaging: SKILL.md is the canonical skill (TESTING.md is its
 * standalone companion doc, linked, never duplicated). This script projects
 * SKILL.md into every agent-specific adapter so nothing drifts.
 *
 *   node scripts/sync-adapters.mjs           # write all adapters
 *   node scripts/sync-adapters.mjs --check   # verify they are up to date (CI)
 *
 * Never edit the generated files by hand — edit SKILL.md and re-run this.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

const GH_BLOB = "https://github.com/rosenjcb/spec.md/blob/main";

const BANNER = (source) =>
  `<!-- GENERATED FROM ${source} — do not edit. Run: pnpm run sync (or node scripts/sync-adapters.mjs) -->`;

/** Split leading `--- ... ---` frontmatter from a markdown file. */
function split(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { fm: {}, body: text.trim() };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { fm, body: text.slice(m[0].length).trim() };
}

const skillRaw = readFileSync(join(root, "SKILL.md"), "utf8");
const { fm, body } = split(skillRaw);
const description =
  fm.description ||
  "Author or update *.spec.md files — Open Knowledge Format specs that keep intent, behavior, and verification aligned.";

const intro = (agent) =>
  `${BANNER("SKILL.md")}\n\n> This guide teaches ${agent} to author and maintain \`*.spec.md\` files — ` +
  `the [spec.md](https://github.com/rosenjcb/spec.md) format. It is generated from the canonical ` +
  `[SKILL.md](${GH_BLOB}/SKILL.md); see it and [TESTING.md](${GH_BLOB}/TESTING.md) for the source of truth.\n`;

// Each target: { path, render(body) -> string }
const targets = [
  // Plugin skill copy (Claude Code plugin auto-discovers skills/<name>/SKILL.md).
  {
    path: "skills/spec-md/SKILL.md",
    render: () => skillRaw.trimEnd() + "\n",
  },
  // Portable format read by many text-parsing agents (Codex, Jules, etc.).
  {
    path: "AGENTS.md",
    render: () =>
      `# AGENTS.md — spec.md\n\n${BANNER("SKILL.md")}\n\n` +
      `When working with \`*.spec.md\` files in this repository, follow the rules below.\n\n` +
      `---\n\n${body}\n`,
  },
  // Cursor rules (activate on spec files).
  {
    path: ".cursor/rules/spec-md.mdc",
    render: () =>
      `---\ndescription: ${description}\nglobs: **/*.spec.md\nalwaysApply: false\n---\n\n` +
      `${intro("Cursor")}\n---\n\n${body}\n`,
  },
  // Windsurf rules.
  {
    path: ".windsurf/rules/spec-md.md",
    render: () =>
      `---\ntrigger: glob\nglobs: **/*.spec.md\ndescription: ${description}\n---\n\n` +
      `${intro("Windsurf")}\n---\n\n${body}\n`,
  },
  // Cline rules.
  {
    path: ".clinerules/spec-md.md",
    render: () => `# spec.md rules\n\n${intro("Cline")}\n---\n\n${body}\n`,
  },
  // GitHub Copilot repository instructions.
  {
    path: ".github/copilot-instructions.md",
    render: () =>
      `# Copilot instructions — spec.md\n\n${BANNER("SKILL.md")}\n\n` +
      `This repository uses the [spec.md](https://github.com/rosenjcb/spec.md) format. ` +
      `When creating or editing \`*.spec.md\` files, follow these rules.\n\n---\n\n${body}\n`,
  },
];

let drift = 0;
let wrote = 0;
for (const t of targets) {
  const abs = join(root, t.path);
  const next = t.render();
  const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
  if (current === next) continue;
  if (CHECK) {
    console.error(`✗ out of date: ${t.path}`);
    drift++;
  } else {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, next);
    console.log(`✓ wrote ${t.path}`);
    wrote++;
  }
}

if (CHECK) {
  if (drift) {
    console.error(`\n${drift} adapter(s) out of date. Run: pnpm run sync`);
    process.exit(1);
  }
  console.log("✓ all adapters are in sync with SKILL.md");
} else {
  console.log(wrote ? `\n${wrote} file(s) updated.` : "\nAlready up to date.");
}
