/**
 * Mirror @rosenjcb/spec-md's version into every consumer-facing manifest.
 * Run after `changeset version` (via `npm run changeset:version`).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CLI_PKG_JSON, REPO_ROOT, readCliVersion } from './release-package.mjs'

const root = REPO_ROOT
const version = readCliVersion()

function updateJson(relPath, mutator) {
  const abs = path.join(root, relPath)
  const data = JSON.parse(readFileSync(abs, 'utf-8'))
  mutator(data)
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
  console.log(`→ ${relPath} version ${version}`)
}

updateJson('package.json', data => {
  data.version = version
})

updateJson('.claude-plugin/plugin.json', data => {
  data.version = version
})

updateJson('.claude-plugin/marketplace.json', data => {
  data.metadata.version = version
  for (const plugin of data.plugins) {
    plugin.version = version
  }
})

const readmePath = path.join(root, 'README.md')
const readme = readFileSync(readmePath, 'utf-8')
const short = version.replace(/\.0$/, '')
const next = readme.replace(
  /img\.shields\.io\/badge\/version-[^-]+-/,
  `img.shields.io/badge/version-${short}-`
)
if (next !== readme) {
  writeFileSync(readmePath, next, 'utf-8')
  console.log(`→ README.md version badge ${short}`)
}

console.log(`✓ Synced consumer manifests to @rosenjcb/spec-md v${version}`)
