/**
 * Tag @rosenjcb/spec-md's version on push to main after the merge gate passes.
 * changesets.yml publishes npm + a GitHub Release in the same run when the tag
 * is newly created (see the `created` output below).
 */
import { execSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

import { readCliVersion, releaseTag } from './release-package.mjs'

const version = readCliVersion()
const tag = releaseTag(version)

/** Expose a value to later workflow steps (no-op when run locally). */
function setOutput(key, value) {
  const file = process.env.GITHUB_OUTPUT
  if (file) appendFileSync(file, `${key}=${value}\n`)
}

/**
 * True when the tag already exists. The remote is authoritative for whether a
 * version has already been released; fall back to local tags if origin is
 * unreachable (e.g. offline local runs).
 */
function tagExists(name) {
  try {
    const remote = execSync(`git ls-remote --tags origin "refs/tags/${name}"`, {
      encoding: 'utf-8',
    }).trim()
    if (remote) return true
  } catch {
    // origin unreachable — fall back to the local ref below.
  }
  try {
    execSync(`git rev-parse -q --verify "refs/tags/${name}"`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

setOutput('version', version)
setOutput('tag', tag)

if (tagExists(tag)) {
  console.log(`Tag ${tag} already exists, skipping`)
  setOutput('created', 'false')
  process.exit(0)
}

execSync(`git tag ${tag}`, { stdio: 'inherit' })
execSync(`git push origin ${tag}`, { stdio: 'inherit' })
console.log(`✓ Tagged @rosenjcb/spec-md release ${tag}`)
setOutput('created', 'true')
