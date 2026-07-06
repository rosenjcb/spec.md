/**
 * Merge-to-main version gate for @rosenjcb/spec-md.
 *
 * Policy: create one pending `.changeset/*.md`, run `pnpm run changeset:version` on
 * the branch, commit, then merge. Versioning is not performed after merge.
 *
 * Usage:
 *   node scripts/check-changeset-consistency.mjs --base origin/main
 *   node scripts/check-changeset-consistency.mjs --assert-no-pending
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI_PKG = 'cli/package.json'

function parseArgs(argv) {
  let base = 'origin/main'
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--base' && argv[i + 1]) {
      base = argv[++i]
      continue
    }
    if (argv[i] === '--assert-no-pending') continue
    throw new Error(`Unknown argument: ${argv[i]}`)
  }
  return { base }
}

function git(args) {
  return execSync(`git ${args}`, { cwd: root, encoding: 'utf-8' }).trim()
}

function listPendingChangesets() {
  const dir = path.join(root, '.changeset')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(name => name.endsWith('.md') && name !== 'README.md')
    .map(name => `.changeset/${name}`)
}

function readVersionAt(ref, file) {
  try {
    return JSON.parse(git(`show ${ref}:${file}`)).version
  } catch {
    return null
  }
}

function readHeadVersion(file) {
  return JSON.parse(readFileSync(path.join(root, file), 'utf-8')).version
}

function parseSemver(version) {
  const parts = version.split('.').map(Number)
  if (parts.length !== 3 || parts.some(n => !Number.isFinite(n) || n < 0)) {
    throw new Error(`Cannot parse semver: ${version}`)
  }
  return parts
}

function compareSemver(a, b) {
  const [aMaj, aMin, aPat] = parseSemver(a)
  const [bMaj, bMin, bPat] = parseSemver(b)
  if (aMaj !== bMaj) return aMaj - bMaj
  if (aMin !== bMin) return aMin - bMin
  return aPat - bPat
}

export function isSingleSemverStep(base, head) {
  const [bMaj, bMin, bPat] = parseSemver(base)
  const [hMaj, hMin, hPat] = parseSemver(head)
  if (hMaj === bMaj && hMin === bMin && hPat === bPat + 1) return true
  if (hMaj === bMaj && hMin === bMin + 1 && hPat === 0) return true
  if (hMaj === bMaj + 1 && hMin === 0 && hPat === 0) return true
  return false
}

function formatExpectedBumpSteps(base) {
  const [maj, min, pat] = parseSemver(base)
  return `${maj}.${min}.${pat + 1} (patch), ${maj}.${min + 1}.0 (minor), or ${maj + 1}.0.0 (major)`
}

export function shippedSourceChanged(changedFiles) {
  return changedFiles.some(file => {
    if (file.endsWith('.spec.md')) return false
    if (file.startsWith('cli/test/')) return false
    if (file.startsWith('scripts/test/')) return false
    if (file.startsWith('cli/') && !file.startsWith('cli/CHANGELOG.md')) return true
    if (file === 'action.yml') return true
    return false
  })
}

export function evaluateChangesetConsistency(input) {
  const errors = []
  const notes = []

  if (input.pendingChangesets.length > 1) {
    errors.push(
      `At most one changeset per PR; found ${input.pendingChangesets.length}: ${input.pendingChangesets.join(', ')}.`
    )
    return { ok: false, errors, notes }
  }

  if (!shippedSourceChanged(input.changedFiles)) {
    notes.push('No shipped CLI/action changes — version bump not required.')
    return { ok: true, errors, notes }
  }

  if (input.pendingChangesets.length === 1) {
    errors.push(
      `Pending changeset not applied: ${input.pendingChangesets[0]}. Run \`pnpm run changeset:version\`, commit, then push.`
    )
  }

  const { base, head } = input.cli
  if (base === null) {
    if (head) notes.push(`@rosenjcb/spec-md introduced at ${head}`)
    return { ok: errors.length === 0, errors, notes }
  }

  if (base === head) {
    errors.push(
      `@rosenjcb/spec-md source changed but version is still ${base}. Add a changeset and run \`pnpm run changeset:version\`.`
    )
    return { ok: false, errors, notes }
  }

  try {
    if (!isSingleSemverStep(base, head)) {
      if (compareSemver(base, head) >= 0) {
        errors.push(`Version did not move forward (${base} → ${head}).`)
      } else {
        errors.push(
          `Version jumped more than one semver step (${base} → ${head}). Expected one of: ${formatExpectedBumpSteps(base)}.`
        )
      }
      return { ok: false, errors, notes }
    }
  } catch {
    errors.push(`Invalid semver (base: ${base}, head: ${head}).`)
    return { ok: false, errors, notes }
  }

  notes.push(`@rosenjcb/spec-md ${base} → ${head}`)
  return { ok: errors.length === 0, errors, notes }
}

function assertNoPendingChangesets() {
  const pending = listPendingChangesets()
  if (pending.length === 0) {
    console.log('✓ No pending changesets.')
    return
  }
  for (const file of pending) {
    console.error(`❌ Pending changeset on main: ${file}`)
  }
  console.error(
    'Apply the bump on the PR branch (`pnpm run changeset:version`), commit, then merge.'
  )
  process.exit(1)
}

function runMergeGate(base) {
  try {
    git(`fetch --no-tags origin ${base.replace(/^origin\//, '')}`)
  } catch {
    // Local branch without remote.
  }

  const changedFiles = git(`diff --name-only ${base}...HEAD`)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const result = evaluateChangesetConsistency({
    changedFiles,
    pendingChangesets: listPendingChangesets(),
    cli: {
      base: readVersionAt(base, CLI_PKG),
      head: readHeadVersion(CLI_PKG),
    },
  })

  for (const note of result.notes) console.log(`✓ ${note}`)
  if (!result.ok) {
    for (const error of result.errors) console.error(`❌ ${error}`)
    process.exit(1)
  }
  console.log('✓ Version bump is consistent.')
}

function main() {
  if (process.argv.includes('--assert-no-pending')) {
    assertNoPendingChangesets()
    return
  }

  const { base } = parseArgs(process.argv)
  runMergeGate(base)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
