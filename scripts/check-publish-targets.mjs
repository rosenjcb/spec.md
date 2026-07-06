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

import { CLI_PKG_JSON, NPM_PACKAGE, REPO_ROOT, readCliVersion } from './release-package.mjs'

const CHECK_NPM = process.argv.includes('--check-npm')
const root = REPO_ROOT
const errors = []
const notes = []

function readJson(relPath) {
  return JSON.parse(readFileSync(path.join(root, relPath), 'utf-8'))
}

function expectVersion(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected}, got ${actual}`)
    return false
  }
  notes.push(`${label} @ ${actual}`)
  return true
}

const cliVersion = readCliVersion()

expectVersion('package.json', readJson('package.json').version, cliVersion)
expectVersion('.claude-plugin/plugin.json', readJson('.claude-plugin/plugin.json').version, cliVersion)

const marketplace = readJson('.claude-plugin/marketplace.json')
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

const plugin = readJson('.claude-plugin/plugin.json')
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

if (CHECK_NPM) {
  try {
    const published = execSync(`npm view ${NPM_PACKAGE} version`, { encoding: 'utf-8' }).trim()
    if (published !== cliVersion) {
      errors.push(`npm registry has ${published} but repo is ${cliVersion}`)
    } else {
      notes.push(`npm registry @ ${published}`)
    }
  } catch {
    errors.push(
      `${NPM_PACKAGE} is not on npm yet — run the first publish steps in RELEASING.md`
    )
  }
}

for (const note of notes) console.log(`✓ ${note}`)

if (errors.length) {
  for (const error of errors) console.error(`❌ ${error}`)
  process.exit(1)
}

console.log('✓ Publish targets are consistent.')
