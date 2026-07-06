/**
 * Tag @rosenjcb/spec-md's version on push to main after the merge gate passes.
 * release.yml publishes npm + GitHub Release when the tag is pushed.
 */
import { execSync } from 'node:child_process'

import { readCliVersion, releaseTag } from './release-package.mjs'

const version = readCliVersion()
const tag = releaseTag(version)

try {
  execSync(`git tag ${tag}`, { stdio: 'inherit' })
  execSync(`git push origin ${tag}`, { stdio: 'inherit' })
  console.log(`✓ Tagged @rosenjcb/spec-md release ${tag}`)
} catch {
  console.log(`Tag ${tag} already exists, skipping`)
}
