#!/usr/bin/env node
// Zero-dependency test runner for the spec-md CLI.
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const bin = resolve(here, "../bin/spec-md.js");
const exampleSpec = resolve(here, "../../examples/pizza-ts");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n    ${e.message}`);
  }
}

/** Run the CLI, returning { code, out }. Never throws on non-zero exit. */
function run(args, opts = {}) {
  try {
    const out = execFileSync("node", [bin, ...args], {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
      ...opts,
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
}

function withTempSpec(contents, fn) {
  const dir = mkdtempSync(join(tmpdir(), "spec-md-test-"));
  try {
    const file = join(dir, "thing.spec.md");
    writeFileSync(file, contents);
    fn(dir, file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log("spec-md CLI tests\n");

test("lint passes on the pizza-ts example", () => {
  const { code, out } = run(["lint", exampleSpec]);
  assert.equal(code, 0, out);
  assert.match(out, /0 error/);
});

test("coverage reports 100% on the example", () => {
  const { code, out } = run(["coverage", exampleSpec]);
  assert.equal(code, 0, out);
  assert.match(out, /100%/);
});

test("lint flags a spec missing `type`", () => {
  withTempSpec(
    `---\ntitle: No type\n---\n### Functional Requirements\n| ID | Requirement |\n|----|----|\n| FR-1 | x |\n`,
    (_dir, file) => {
      const { code, out } = run(["lint", file]);
      assert.equal(code, 1, out);
      assert.match(out, /missing required key `type`/);
    },
  );
});

test("lint flags duplicate FR ids and dangling FR references", () => {
  withTempSpec(
    `---\ntype: Spec\ntitle: Dup\n---\n### Functional Requirements\n| ID | Requirement |\n|----|----|\n| FR-1 | a |\n| FR-1 | b |\n### QA Test Cases\n| Test ID | Requirement | Scenario | Expected Outcome |\n|--|--|--|--|\n| TC-1 | FR-9 | x | y |\n`,
    (_dir, file) => {
      const { code, out } = run(["lint", file]);
      assert.equal(code, 1, out);
      assert.match(out, /Duplicate requirement id FR-1/);
      assert.match(out, /references FR-9/);
    },
  );
});

test("coverage --strict exits non-zero when a TC has no test", () => {
  withTempSpec(
    `---\ntype: Spec\ntitle: Uncovered\n---\n### QA Test Cases\n| Test ID | Requirement | Scenario | Expected Outcome |\n|--|--|--|--|\n| TC-1 | FR-1 | x | y |\n`,
    (dir) => {
      const { code, out } = run(["coverage", "--strict", dir]);
      assert.equal(code, 1, out);
      assert.match(out, /uncovered/);
    },
  );
});

test("new scaffolds a spec that lints clean of errors", () => {
  const dir = mkdtempSync(join(tmpdir(), "spec-md-new-"));
  try {
    const out = join(dir, "widget.spec.md");
    const r1 = run(["new", "widget", "--out", out]);
    assert.equal(r1.code, 0, r1.out);
    assert.ok(existsSync(out));
    const r2 = run(["lint", out]);
    assert.equal(r2.code, 0, r2.out); // warnings ok, no errors
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("help and version work", () => {
  assert.equal(run(["--version"]).code, 0);
  assert.match(run(["--help"]).out, /Usage/);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
