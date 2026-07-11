/**
 * Validate that every publish surface agrees on version and shape.
 *
 *   node scripts/check-publish-targets.mjs
 *   node scripts/check-publish-targets.mjs --check-npm
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

import { CLI_PKG_JSON, NPM_PACKAGE, REPO_ROOT, readPackageVersion } from './release-package.mjs'

function readJson(root, relPath) {
  return JSON.parse(readFileSync(path.join(root, relPath), 'utf-8'))
}

/** Look up a specific version on npm (not the `latest` dist-tag). */
export function lookupNpmPackageVersion(pkg, version) {
  try {
    return execSync(`npm view ${pkg}@${version} version --prefer-online`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

/**
 * @param {{
 *   root?: string
 *   checkNpm?: boolean
 *   npmVersion?: string | null
 *   npmLookupError?: boolean
 * }} [options]
 */
export function evaluatePublishTargets(options = {}) {
  const root = options.root ?? REPO_ROOT
  const checkNpm = options.checkNpm ?? false
  const errors = []
  const notes = []

  function expectVersion(label, actual, expected) {
    if (actual !== expected) {
      errors.push(`${label}: expected ${expected}, got ${actual}`)
      return false
    }
    notes.push(`${label} @ ${actual}`)
    return true
  }

  const cliVersion = readPackageVersion(path.join(root, 'cli/package.json'))

  expectVersion('package.json', readJson(root, 'package.json').version, cliVersion)
  expectVersion('.claude-plugin/plugin.json', readJson(root, '.claude-plugin/plugin.json').version, cliVersion)

  const marketplace = readJson(root, '.claude-plugin/marketplace.json')
  expectVersion('marketplace.metadata.version', marketplace.metadata?.version, cliVersion)

  if (!marketplace.name) errors.push('marketplace.json: missing name')
  if (!marketplace.owner?.name) errors.push('marketplace.json: missing owner.name')
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    errors.push('marketplace.json: plugins array is empty')
  } else {
    for (const plugin of marketplace.plugins) {
      if (!plugin.name) errors.push('marketplace.json: plugin missing name')
      if (!plugin.source) errors.push(`marketplace.json: plugin ${plugin.name ?? '?'} missing source`)
      expectVersion(`marketplace.plugins.${plugin.name}.version`, plugin.version, cliVersion)
    }
  }

  const plugin = readJson(root, '.claude-plugin/plugin.json')
  if (!plugin.name) errors.push('plugin.json: missing name')
  if (!plugin.description) errors.push('plugin.json: missing description')

  const actionYml = readFileSync(path.join(root, 'action.yml'), 'utf-8')
  if (!actionYml.includes(NPM_PACKAGE)) {
    errors.push(`action.yml does not reference ${NPM_PACKAGE}`)
  } else {
    notes.push(`action.yml references ${NPM_PACKAGE}`)
  }

  if (!readFileSync(path.join(root, 'README.md'), 'utf-8').includes(cliVersion.replace(/\.0$/, ''))) {
    errors.push('README.md version badge does not match CLI version')
  }

  if (checkNpm) {
    let published = options.npmVersion
    if (published === undefined && !options.npmLookupError) {
      published = lookupNpmPackageVersion(NPM_PACKAGE, cliVersion)
    }

    if (options.npmLookupError || published === null) {
      errors.push(
        `${NPM_PACKAGE}@${cliVersion} is not on npm yet — run the first publish steps in RELEASING.md`
      )
    } else if (published !== cliVersion) {
      errors.push(`npm registry has ${published} but repo is ${cliVersion}`)
    } else {
      notes.push(`npm registry @ ${published}`)
    }
  }

  return { ok: errors.length === 0, errors, notes }
}

function sleepSync(ms) {
  execSync(`sleep ${Math.max(1, Math.ceil(ms / 1000))}`, { stdio: 'ignore' })
}

/**
 * Post-publish registry replicas lag; retry the exact-version check with backoff.
 * @param {{ retries?: number, delayMs?: number }} [options]
 */
export function evaluatePublishTargetsWithNpmRetry(options = {}) {
  const retries = options.retries ?? 5
  const delayMs = options.delayMs ?? 2000
  let result = evaluatePublishTargets({ checkNpm: true })
  for (let attempt = 1; !result.ok && attempt < retries; attempt++) {
    const npmError = result.errors.some(e => e.includes('is not on npm yet') || e.includes('npm registry'))
    if (!npmError) break
    console.error(`⏳ npm not ready (attempt ${attempt}/${retries}), retrying in ${delayMs}ms…`)
    sleepSync(delayMs)
    result = evaluatePublishTargets({ checkNpm: true })
  }
  return result
}

function main() {
  const checkNpm = process.argv.includes('--check-npm')
  const result = checkNpm
    ? evaluatePublishTargetsWithNpmRetry()
    : evaluatePublishTargets({ checkNpm: false })
  for (const note of result.notes) console.log(`✓ ${note}`)
  if (!result.ok) {
    for (const error of result.errors) console.error(`❌ ${error}`)
    process.exit(1)
  }
  console.log('✓ Publish targets are consistent.')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
