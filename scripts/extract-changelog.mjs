/**
 * Print a changelog section from cli/CHANGELOG.md (changeset-generated).
 *
 * Usage: node scripts/extract-changelog.mjs [version]
 */
import { readFileSync } from 'node:fs'

import { CLI_CHANGELOG } from './release-package.mjs'

const wanted = process.argv[2]?.replace(/^v/, '')

let changelog = ''
try {
  changelog = readFileSync(CLI_CHANGELOG, 'utf-8')
} catch {
  process.exit(0)
}

const lines = changelog.split('\n')
const isVersionHeading = line => /^##\s+/.test(line)

let start = -1
for (let i = 0; i < lines.length; i++) {
  if (!isVersionHeading(lines[i])) continue
  const version = lines[i].replace(/^##\s+/, '').trim()
  if (!wanted || version === wanted) {
    start = i
    break
  }
}

if (start === -1) process.exit(0)

let end = lines.length
for (let i = start + 1; i < lines.length; i++) {
  if (isVersionHeading(lines[i])) {
    end = i
    break
  }
}

const body = lines.slice(start + 1, end).join('\n').trim()
if (body) process.stdout.write(`${body}\n`)
