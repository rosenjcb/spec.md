/** Render a frontmatter path list as a YAML inline array. */
function yamlList(value, fallback) {
  const items = String(value || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return `[${items.join(", ")}]`;
}

/** Scaffold body for `spec-md new <domain>`. */
export function specTemplate({ domain, title, sources, tests }) {
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const cap = domain.charAt(0).toUpperCase() + domain.slice(1);
  return `---
type: Spec
title: "Spec: ${title || cap}"
sources: ${yamlList(sources, `./src/${domain}`)}
tests: ${yamlList(tests, `./test/${domain}`)}
description: The specification for the ${cap} domain
tags: [${domain}]
timestamp: ${now}
---

### Intro

<!-- One or two paragraphs: the system's purpose, its role as system of
record, and its lifecycle boundaries (what is immutable, what flows
downstream). -->

### Definitions

<!-- Shared vocabulary. Only terms specific to this system or ambiguous
without definition. Include the field name where it helps. -->

- ${cap}: <!-- ... -->

### Scope

## In Scope
- <!-- what this system does -->

## Out of Scope
- <!-- what this system explicitly does not own -->

### Functional Requirements

<!-- Higher-level, testable statements of intent. One behavior per row.
FR-N ids must be contiguous and ascending (FR-1..FR-n). Default: append n+1. -->

| ID   | Requirement |
|------|-------------|
| FR-1 | <!-- ... --> |

### QA Test Cases

<!-- Concrete checks. A single FR is usually proven by several TCs.
TC-N ids must be contiguous and ascending (TC-1..TC-n). Tests link via [TC-N].
Cleanup that reorders rows must renumber 1..n and update [TC-N] tags. -->

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-1 | FR-1 | <!-- input --> | <!-- expected --> |
`;
}
