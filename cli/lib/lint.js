import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseSpec, pathList } from "./parse.js";

const ISO_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * Lint a single spec file. Returns { filePath, problems, spec, stats }.
 * Each problem is { level: "error"|"warn", msg, line }.
 */
export function lintSpec(filePath) {
  const spec = parseSpec(filePath);
  const problems = [];
  const dir = dirname(filePath);
  const fm = spec.frontmatter;

  const err = (msg, line) => problems.push({ level: "error", msg, line });
  const warn = (msg, line) => problems.push({ level: "warn", msg, line });

  // --- Frontmatter ---
  if (!spec.hasFrontmatter) {
    err("Missing YAML frontmatter block (--- ... ---)", 1);
  }
  if (!fm.type) {
    err("Frontmatter is missing required key `type`", 1);
  } else if (fm.type !== "Spec") {
    err(`Frontmatter \`type\` must be "Spec" (found "${fm.type}")`, 1);
  }
  if (!fm.title) {
    err("Frontmatter is missing required key `title`", 1);
  }
  if (fm.timestamp && !ISO_RE.test(String(fm.timestamp))) {
    warn(`\`timestamp\` is not a valid ISO 8601 date: "${fm.timestamp}"`, 1);
  }

  // sources / tests paths should resolve on disk.
  for (const field of ["sources", "tests"]) {
    for (const p of pathList(fm[field])) {
      if (!existsSync(resolve(dir, p))) {
        warn(`\`${field}\` path does not exist (spec-relative): ${p}`, 1);
      }
    }
  }

  // --- Functional Requirements ---
  if (!spec.sawFrTable) {
    warn("No Functional Requirements table found", null);
  }
  const frIds = new Set();
  for (const fr of spec.frs) {
    if (!fr.valid) {
      err(`Malformed requirement id "${fr.id}" (expected FR-<number>)`, fr.line);
    }
    if (frIds.has(fr.id)) {
      err(`Duplicate requirement id ${fr.id}`, fr.line);
    }
    frIds.add(fr.id);
  }

  // --- QA Test Cases ---
  if (!spec.sawTcTable) {
    warn("No QA Test Cases table found", null);
  }
  const tcIds = new Set();
  const referencedFrs = new Set();
  for (const tc of spec.tcs) {
    if (!tc.valid) {
      err(`Malformed test-case id "${tc.id}" (expected TC-<number>)`, tc.line);
    }
    if (tcIds.has(tc.id)) {
      err(`Duplicate test-case id ${tc.id}`, tc.line);
    }
    tcIds.add(tc.id);

    if (tc.removed) continue;
    if (tc.requirements.length === 0) {
      warn(`${tc.id} does not cite a Functional Requirement`, tc.line);
    }
    for (const ref of tc.requirements) {
      referencedFrs.add(ref);
      if (!frIds.has(ref)) {
        err(`${tc.id} references ${ref}, which has no Functional Requirement row`, tc.line);
      }
    }
  }

  // Every FR should be proven by at least one TC.
  for (const fr of spec.frs) {
    if (fr.removed) continue;
    if (!referencedFrs.has(fr.id)) {
      warn(`${fr.id} has no QA Test Case referencing it`, fr.line);
    }
  }

  return {
    filePath,
    problems,
    spec,
    stats: {
      frs: spec.frs.length,
      tcs: spec.tcs.length,
      errors: problems.filter((p) => p.level === "error").length,
      warnings: problems.filter((p) => p.level === "warn").length,
    },
  };
}
