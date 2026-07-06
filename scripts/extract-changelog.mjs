/**
 * Print a changelog section from cli/CHANGELOG.md (changeset-generated).
 *
 * Usage: node scripts/extract-changelog.mjs [version]
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CLI_CHANGELOG } from './release-package.mjs'

/** @param {string} changelog */
/** @param {string | undefined} wanted */
export function extractChangelogSection(changelog, wanted) {
  const wantedVersion = wanted?.replace(/^v/, '')
  const lines = changelog.split('\n')
  const isVersionHeading = line => /^##\s+/.test(line)

  let start = -1
  for (let i = 0; i < lines.length; i++) {
    if (!isVersionHeading(lines[i])) continue
    const version = lines[i].replace(/^##\s+/, '').trim()
    if (!wantedVersion || version === wantedVersion) {
      start = i
      break
    }
  }

  if (start === -1) return ''

  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (isVersionHeading(lines[i])) {
      end = i
      break
    }
  }

  return lines.slice(start + 1, end).join('\n').trim()
}

function main() {
  const wanted = process.argv[2]
  let changelog = ''
  try {
    changelog = readFileSync(CLI_CHANGELOG, 'utf-8')
  } catch {
    return
  }

  const body = extractChangelogSection(changelog, wanted)
  if (body) process.stdout.write(`${body}\n`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
