# Review & sign-off in spec.md

Version 0.1 — Draft

This document describes how a `*.spec.md` gets reviewed, acknowledged, and
signed off by the people around it — without duplicating the spec into a
second artifact that can drift.

A spec already carries *what* the system should do (`FR-N`) and *what proves
it* (`TC-N`). What it does not carry is *who* has a say and *what their say
means*. Teams usually solve this with a "sign-off sheet" that restates the
requirements for stakeholders — and that is the trap: the sheet and the spec
inevitably diverge, and the signature ends up attached to text nobody is
building from. If the spec says one thing and the sheet says another, what did
the signee actually approve?

The convention here is the opposite: **roles live in the spec's metadata, and
the review artifact is a pointer, never a copy.**

---

## Two rules, everything else is style

1. **State the goal.** Every review request declares what it is for. "Getting
   sign-off" hides at least three different goals — making stakeholders
   *aware*, giving them an *opportunity for input*, or making them
   *accountable* for a decision. Each demands something different from the
   people involved, so the request must say which it is (see
   [Modes](#modes-notice-vs-signoff)).
2. **Point, don't copy.** The review record links to the spec. It never
   restates requirements, scope, or behavior. The spec is the only place the
   content lives; the record only tracks who was asked, what they were asked
   for, and what they said.

Rule 2 presupposes there is something to point at: **the spec exists before
the review does**, even if it is a skeletal draft. It does not have to be
finished — how much of it must exist depends on the milestone (see
[Reviewable minimums](#reviewable-minimums)). If there is nothing to link
yet, you are not ready for a review.

---

## Roles: DACI

spec.md uses [DACI](https://www.atlassian.com/team-playbook/plays/daci)
(Driver, Approver, Contributors, Informed) rather than classic RACI. A spec
review is a *decision*, not a task breakdown, and DACI's single-approver
discipline avoids the most common sign-off failure: six signatures, zero
scrutiny. (If you think in RACI: Driver ≈ Responsible, Approver ≈ Accountable,
Contributors ≈ Consulted.)

Each role is asked for something different — that is the point. A signature
from someone who only needed a heads-up is noise; a heads-up to someone who
should have had a veto is a gap.

| Role | Verb | What the review asks of them |
|------|------|------------------------------|
| **Driver** | *proposes* | Authors the spec, runs the review, closes it out. |
| **Approver** | *approves* | Reads the spec, explicitly signs off. Blocking. Ideally one person. |
| **Contributors** | *review* | Domain input within a stated window. Silence past the deadline = no objection ("lazy consensus"). |
| **Informed** | *acknowledge* | Notified with a link. No signature — at most a read-receipt. |

Keep the approver list short. One is the DACI ideal; if a spec seems to need
several approvers, that is usually a sign it covers more than one decision —
consider splitting it.

---

## Spec front matter

Roles are declared in the spec's own metadata, alongside the existing keys.
All of these are optional, like the rest of the frontmatter — add them when a
spec reaches the point of needing a review.

```yaml
---
type: Spec
title: "Spec: Orders"
sources: ./src/orders
tests: ./test/orders
status: in-review
driver: jacob@example.com
approvers: [alex@example.com]
contributors: [qa-leads, dana@example.com]
informed: [support, sales]
review: https://notion.so/orders-spec-review
timestamp: 2026-07-09T14:30:00Z
---
```

| Key | Required | Purpose |
|-----|----------|---------|
| `status` | No | Where the spec is in its life: `draft`, `in-review`, `approved`, `superseded` (suggested vocabulary, not enforced). |
| `driver` | No | The person authoring the spec and running its review. |
| `approvers` | No | Who must explicitly sign off. Keep it to one or two. |
| `contributors` | No | Who is asked for input. People or team aliases. |
| `informed` | No | Who gets notified. No action expected of them. |
| `review` | No | URL of the review record (see below) — the counterpart of `resource`. |

`status: approved` does **not** mean frozen. A spec is living; the status
reflects the most recent review round, not a promise that nothing will change.

---

## The review record

The review record is the artifact stakeholders actually interact with. It
lives in your knowledge base (Notion, Confluence, a Google Doc) — not in the
repo — and the spec's `review` key points at it.

Its contract is rule 2: **no restated content.** It contains:

- The **mode, milestone, and goal**, stated up front (see below).
- A **link to the spec** — optionally noting the version reviewed (a commit
  SHA or page version), so a later reader can see what has changed since.
- The **DACI table** — who holds each role and what they are asked to do,
  with checkboxes for approvers only.
- A **deadline**, and the lazy-consensus rule spelled out.
- On a repeat round: **what changed since the last review, by ID** —
  `FR-3 [UPDATED]`, `TC-9 [NEW]`. Because `FR-N`/`TC-N` IDs are permanent,
  this list is derivable from the spec's history; nothing is hand-copied.

### Modes: notice vs. signoff

The mode answers rule 1 — what is this review *for?*

- **`notice`** — the goal is awareness. No signatures are collected; the
  record is a broadcast with a link and an open invitation to comment. At
  most, track acknowledgments to learn who actually reads what you send.
- **`signoff`** — the goal is accountability. Approvers must explicitly
  check the box; contributors get an input window; the driver ships when the
  approvals are in or the deadline passes with no objections.

If you only need people to know something is happening, send a notice — do
not manufacture signatures. If someone is accountable for the outcome, they
sign against the spec itself, having read it.

### Example

```md
# Review: Spec — Orders (pre-build signoff)

**Mode:** signoff
**Spec:** github.com/acme/platform/blob/main/specs/order.spec.md (as of `a1b2c3d`)
**Driver:** Jacob
**Deadline:** 2026-07-16

Please review the linked spec. If you're comfortable with the behavior it
describes, check the box next to your name to signal you've reviewed and
approve. If anything gives you pause, comment on the spec or reach out to
the driver. We ship when every approver has signed off — contributor
silence past the deadline is taken as "no objection."

| Role | Who | Asked to | Done |
|------|-----|----------|------|
| Approver | Alex | Approve | ☐ |
| Contributor | Dana (QA) | Review & comment by deadline | — |
| Contributor | Sam (Design) | Review & comment by deadline | — |
| Informed | Support, Sales | Nothing — FYI | — |

**Changes since last round:** FR-3 [UPDATED], TC-9 [NEW]
```

---

## Milestones, not gates

A review can be requested at any point in a spec's life, and the record says
which point that is. The spec always exists before the review does — that is
what makes rule 2 possible — but "exists" scales with the milestone.

### Reviewable minimums

Each milestone has a reviewable minimum: the sections that must be written
for the review to mean anything, and the question the review is actually
asking.

| Milestone | The spec has at least | The review asks |
|-----------|-----------------------|-----------------|
| **Kickoff** | Frontmatter (`type`, `title`), Intro, Scope — `??` markers and gaps welcome | Are we solving the right problem, with the right boundaries? |
| **Pre-build** | + Definitions and Functional Requirements (`FR-N`); QA Test Cases for the core paths | Is this the behavior we want built? |
| **Pre-release** | + full `TC-N` coverage, `sources`/`tests` linked | Did we ship what the spec says? |

A signee at kickoff is approving boundaries, not behavior — the record's
milestone tells them which. Below the kickoff minimum there is no review to
run: if all you have is an idea, that is a conversation, not a review record.

Nothing here requires the spec to be *finished* before people are brought in —
a kickoff review of a spec that is mostly Scope and open questions is a
perfectly good review. Handoff and authoring can overlap; the milestone just
makes explicit what stage of the spec people are looking at, so nobody
unknowingly signs off on requirements that have not been written yet.

Deliberately, **nothing is enforced yet**. There is no lint rule that a spec
must be `approved`, no gate that invalidates a signature when the spec
changes. When a spec changes materially after a signoff, the driver decides
whether a new round is warranted — the permanent IDs and `[NEW]`/`[UPDATED]`
markers make "what changed since you last looked" cheap to communicate
without restating anything. We want a baseline of how teams actually use
reviews (how many people read, acknowledge, comment) before hardening any of
this into tooling.

---

## Prior art: methodologies we lean on

None of this is invented here. The convention deliberately borrows the
load-bearing part of several established practices:

- **[DACI](https://www.atlassian.com/team-playbook/plays/daci)** (Atlassian) —
  the role vocabulary, and the single-approver discipline that keeps sign-off
  meaningful.
- **[MADR](https://adr.github.io/madr/)** (architecture decision records) —
  `status`, deciders, consulted, and informed as document *metadata* rather
  than prose, flipped by review rather than rewritten.
- **[PEP process](https://peps.python.org/pep-0001/)** — a `Status` field plus
  a `Resolution` link: the document records *that* it was decided and points
  at *where*, instead of embedding the deliberation.
- **[Rust RFC final comment period](https://forge.rust-lang.org/lang/fcp.html)** —
  checkbox-per-reviewer, a time-boxed window, and lazy consensus: silence
  past the deadline is consent, explicit concerns block.
- **[DORA on change approval](https://dora.dev/capabilities/streamlining-change-approval/)** —
  external approval gates correlate with slower delivery and no reduction in
  failure rate. Reviews here are alignment tools, not deployment gates, and
  stay deliberately lightweight.
- **Version-bound approval** (regulated-industry design history files) — a
  signature should attach to a *version reference* of the source document,
  never to restated text. We adopt the pointer discipline as a convention,
  not (yet) as an enforced gate.

---

## Checklist

- [ ] The review record states its mode (`notice` or `signoff`), milestone,
      and goal up front.
- [ ] The spec meets its milestone's reviewable minimum before the record
      goes out.
- [ ] The record links to the spec and contains no restated requirements.
- [ ] Roles in the spec's frontmatter match the record.
- [ ] One (or few) approvers; contributors have a deadline; informed are
      asked for nothing.
- [ ] Repeat rounds list changes by `FR-N`/`TC-N` ID, not by copied text.
