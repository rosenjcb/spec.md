# Releasing spec.md

Automated releases follow the [Changesets](https://github.com/changesets/changesets) flow used in [rosenjcb/kb](https://github.com/rosenjcb/kb): version on the PR branch, tag + publish on merge to `main`.

Repo tooling uses **pnpm** (`pnpm-workspace.yaml`). Consumers still install the CLI from npm (`npm i -D @rosenjcb/spec-md` / `npx`).

## What is automated

| Step | When | Workflow |
|------|------|----------|
| Version bump gate | PR into `main` | `specs.yml` → **Version bump required** |
| Publish target validation | Every CI run | `pnpm run publish:check` |
| Git tag `v{version}` | Merge to `main` | `changesets.yml` |
| npm publish | Tag push | `release.yml` |
| GitHub Release | Tag push | `release.yml` |

## What stays manual (one-time)

### 1. npm — first publish + token

`@rosenjcb/spec-md` is **not on npm yet**. Until it is, the GitHub Action and all `npx` commands fail.

**One-time setup:**

1. Log in to npm (account must own the `@rosenjcb` scope):
   ```bash
   npm login
   ```

2. Publish the current version from your machine:
   ```bash
   cd cli
   npm publish --access public
   ```

3. Create an npm **Automation** or **Publish** token at [npmjs.com/settings](https://www.npmjs.com/settings).

4. Add it to GitHub repo secrets as **`NPM_TOKEN`**:
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: your npm token

After this, `release.yml` publishes every new version automatically when a tag is pushed.

Verify:
```bash
npm view @rosenjcb/spec-md version
# → 0.2.0
```

### 2. GitHub Action Marketplace — first release

GitHub does **not** expose an API for the "Publish to Marketplace" checkbox (2FA / developer agreement).

**One-time setup:**

1. Open [github.com/rosenjcb/spec.md/releases/new](https://github.com/rosenjcb/spec.md/releases/new)

2. If prompted, accept the **GitHub Marketplace Developer Agreement** (repo owner only).

3. Create release **`v0.2.0`** targeting `main`:
   - Tag: `v0.2.0`
   - Title: `@rosenjcb/spec-md v0.2.0`
   - Check **Publish this Action to the GitHub Marketplace**
   - Primary category: **AI Assisted** (or your preference)

4. Click **Publish release**.

If `changesets.yml` already created the `v0.2.0` tag when you merge this PR, edit that release in the UI and enable marketplace publishing instead of creating a duplicate.

**Every later version:** `release.yml` creates the GitHub Release. You still need to open each new release and check **Publish to Marketplace** until GitHub adds API support.

### 3. Claude Code plugin — nothing to publish

`.claude-plugin/marketplace.json` is served from the public GitHub repo. Users install with:

```
/plugin marketplace add rosenjcb/spec.md
/plugin install spec-md@spec-md
```

No separate platform upload. `pnpm run changeset:version` keeps plugin version fields in sync with the CLI.

---

## Day-to-day release workflow

### Ship a change that affects the CLI or Action

1. **Add a changeset** — create `.changeset/your-change.md`:
   ```md
   ---
   "@rosenjcb/spec-md": patch
   ---

   Short summary of the change.
   ```

2. **Apply the bump** on your branch:
   ```bash
   pnpm install
   pnpm run changeset:version
   ```
   This bumps `cli/package.json`, writes `cli/CHANGELOG.md`, and syncs plugin manifests.

3. **Verify locally:**
   ```bash
   pnpm run changeset:check -- --base origin/main
   pnpm run publish:check
   pnpm test
   ```

4. **Open PR → merge to `main`.**

5. CI on `main` tags `v{new-version}` → `release.yml` publishes npm + GitHub Release.

### Docs-only / SKILL.md changes

No version bump required if you did not change `cli/` or `action.yml`. Adapters still need `pnpm run sync`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Version bump required` CI failed | Add changeset + run `pnpm run changeset:version`, commit |
| `publish:check` version mismatch | Run `pnpm run changeset:version` or `node scripts/sync-versions.mjs` |
| `NPM_TOKEN` missing in release | Add secret (step 1 above) |
| npm 404 on `npx @rosenjcb/spec-md` | First publish not done yet (step 1 above) |
| Action works on `@main` but not Marketplace | First marketplace release not published (step 2 above) |
| Tag already exists | Expected if re-running; release workflow should still run for that tag |

## Branch protection (recommended)

Mark these checks as **required** on `main`:

- **lint, test, and coverage**
- **Version bump required**
