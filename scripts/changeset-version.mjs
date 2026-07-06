/**
 * Apply pending changesets, then sync version metadata across the repo.
 *
 *   pnpm run changeset:version
 */
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { readCliVersion } from './release-package.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

console.log('▶ Applying version bump (changeset version)')
execSync('pnpm exec changeset version', { stdio: 'inherit', cwd: root })

execSync('node scripts/sync-versions.mjs', { stdio: 'inherit', cwd: root })

const version = readCliVersion()
console.log(`✓ @rosenjcb/spec-md v${version}. Commit the result; CI verifies before merge.`)
