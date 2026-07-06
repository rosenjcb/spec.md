/**
 * Apply pending changesets, then sync version metadata across the repo.
 *
 *   npm run changeset:version
 */
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { readCliVersion } from './release-package.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const changesetBin = path.join(root, 'node_modules', '.bin', 'changeset')

console.log('▶ Applying version bump (changeset version)')
execSync(`"${changesetBin}" version`, { stdio: 'inherit', cwd: root })

execSync('node scripts/sync-versions.mjs', { stdio: 'inherit', cwd: root })

const version = readCliVersion()
console.log(`✓ @rosenjcb/spec-md v${version}. Commit the result; CI verifies before merge.`)
