#!/usr/bin/env node
/**
 * Add one credential route that reuses an installed pi-ai catalog provider.
 *
 *   providers:
 *     opencode-go:                      # the installed catalog route
 *       apiKeyEnv: OPENCODE_GO_API_KEY
 *     opencode-go-2:                    # this script's addition
 *       catalog: opencode-go            # reuse that catalog: models, wire APIs, headers
 *       displayName: OpenCode Go 2
 *       apiKeyEnv: OPENCODE_GO_API_KEY_2
 *
 * The adding route needs the patched @deepseek-ai/dsh-llm-pi-ai from
 * tools/sync.mjs + tools/install.mjs. Run this afterwards, then restart DSH.
 *
 * Usage:
 *   node tools/add-route.mjs [--profile desktop] [--home <DSH_HOME>]
 *        [--route opencode-go-2] [--catalog opencode-go]
 *        [--key-env OPENCODE_GO_API_KEY_2] [--display-name "OpenCode Go 2"]
 *        [--file <cordis.patch.yml>] [--dry-run]
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
void here

function argValue(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  return process.argv[index + 1]
}

const home = resolve(argValue('--home', process.env.DSH_HOME ?? join(homedir(), '.dsh')))
const profileName = argValue('--profile', 'desktop')
const route = argValue('--route', 'opencode-go-2')
const catalog = argValue('--catalog', 'opencode-go')
const displayName = argValue('--display-name', 'OpenCode Go 2')
const keyEnv = argValue('--key-env', `${route.toUpperCase().replaceAll('-', '_')}_API_KEY`)
const patchPath = resolve(
  argValue('--file', join(home, 'profiles', profileName, 'cordis.patch.yml')),
)
const dryRun = process.argv.includes('--dry-run')

const indentOf = (line) => line.length - line.trimStart().length

function blockLines(indent) {
  return [
    `${' '.repeat(indent)}${route}:`,
    `${' '.repeat(indent + 2)}catalog: ${catalog}`,
    `${' '.repeat(indent + 2)}displayName: ${displayName}`,
    `${' '.repeat(indent + 2)}apiKeyEnv: ${keyEnv}`,
  ]
}

async function main() {
  const text = await readFile(patchPath, 'utf8')
  const lines = text.split(/\r?\n/)

  const entryStart = lines.findIndex((line) => /^\s*-\s+id:\s*llm-pi-ai\s*$/.test(line))
  if (entryStart === -1) {
    console.error(`no "- id: llm-pi-ai" entry in ${patchPath}`)
    console.error('Add this under the llm-pi-ai entry\'s config.providers yourself:')
    console.error(blockLines(6).join('\n'))
    process.exitCode = 1
    return
  }

  let end = lines.length
  for (let index = entryStart + 1; index < lines.length; index += 1) {
    if (indentOf(lines[index]) === 0 && lines[index].trim() !== '') {
      end = index
      break
    }
  }

  const providersAt = lines.findIndex(
    (line, index) => index > entryStart && index < end && /^\s+providers:\s*$/.test(line),
  )
  if (providersAt === -1) {
    console.error(`llm-pi-ai entry in ${patchPath} has no config.providers block`)
    process.exitCode = 1
    return
  }

  const routePattern = new RegExp(`^\\s{${indentOf(lines[providersAt]) + 2}}${route}:\\s*$`)
  if (lines.some((line, index) => index > providersAt && index < end && routePattern.test(line))) {
    console.log(`route "${route}" already declared in ${patchPath}`)
    return
  }

  let childIndent = indentOf(lines[providersAt]) + 2
  for (let index = providersAt + 1; index < end; index += 1) {
    if (lines[index].trim() === '') continue
    if (indentOf(lines[index]) > indentOf(lines[providersAt])) {
      childIndent = indentOf(lines[index])
      break
    }
  }

  let insertAt = end
  for (let index = providersAt + 1; index < end; index += 1) {
    if (lines[index].trim() === '') continue
    if (indentOf(lines[index]) < childIndent) {
      insertAt = index
      break
    }
  }

  const block = blockLines(childIndent)
  if (dryRun) {
    console.log(`[dry-run] insert into ${patchPath} before line ${insertAt + 1}:`)
    console.log(block.join('\n'))
    return
  }

  const backup = `${patchPath}.bak-${Date.now()}`
  await copyFile(patchPath, backup)
  lines.splice(insertAt, 0, ...block)
  await writeFile(patchPath, lines.join('\n'))
  console.log(`added route "${route}" (catalog ${catalog}, key ${keyEnv}) to ${patchPath}`)
  console.log(`backup: ${backup}`)
  console.log('\nIf DSH Desktop is running with the patched package loaded, HMR applies the')
  console.log('new route live. Open Settings → Models and paste the second plan\'s key')
  console.log('into the new row. If the override was just installed, restart DSH first.')
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
