/**
 * Mirror @rosenjcb/spec-md's version into every consumer-facing manifest.
 * Run after `changeset version` (via `pnpm run changeset:version`).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { REPO_ROOT, readPackageVersion } from './release-package.mjs'

/**
 * @param {string} [root]
 * @returns {{ version: string, updated: string[] }}
 */
export function syncVersions(root = REPO_ROOT) {
  const version = readPackageVersion(path.join(root, 'cli/package.json'))
  const updated = []

  function updateJson(relPath, mutator) {
    const abs = path.join(root, relPath)
    const data = JSON.parse(readFileSync(abs, 'utf-8'))
    const before = JSON.stringify(data)
    mutator(data)
    const after = JSON.stringify(data)
    if (before !== after) {
      writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
      updated.push(relPath)
    }
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
    updated.push('README.md')
  }

  return { version, updated }
}

function main() {
  const { version, updated } = syncVersions()
  for (const file of updated) {
    console.log(`→ ${file} version ${version}`)
  }
  console.log(`✓ Synced consumer manifests to @rosenjcb/spec-md v${version}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
