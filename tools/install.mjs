#!/usr/bin/env node
/**
 * Link the patched @deepseek-ai/dsh-llm-pi-ai into a DSH profile.
 *
 * The profile's pnpm-managed node_modules resolves before the bundled package,
 * so the loader imports this local copy for the existing `llm-pi-ai` row — the
 * composition, settings namespace, and route names stay exactly what they are.
 *
 * Usage:
 *   node tools/install.mjs [--profile desktop] [--home <DSH_HOME>] [--dry-run]
 *
 * Restart DSH Desktop afterwards. Re-run tools/sync.mjs after a DSH update.
 */
import { copyFile, readFile, realpath, writeFile } from 'node:fs/promises'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const packageDir = resolve(here, '..')

function argValue(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  return process.argv[index + 1]
}

const home = resolve(argValue('--home', process.env.DSH_HOME ?? join(homedir(), '.dsh')))
const profileName = argValue('--profile', 'desktop')
const dryRun = process.argv.includes('--dry-run')
const profileDir = join(home, 'profiles', profileName)
const manifestPath = join(profileDir, 'package.json')
const lockPath = join(profileDir, 'pnpm-lock.yaml')
const PACKAGE_NAME = '@deepseek-ai/dsh-llm-pi-ai'

function stamp() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

function findRuntimeBin(name) {
  const relative =
    name === 'pnpm'
      ? ['dependencies', 'pnpm', 'bin', 'pnpm.mjs']
      : ['dependencies', 'node', 'bin', 'node.exe']
  const candidates = [
    join('G:\\programs\\DSH\\resources\\runtime\\primary-runtime', ...relative),
    join(home, 'dsh-runtimes', 'dsh-primary-runtime', ...relative),
  ]
  const runtimes = join(home, 'dsh-runtimes')
  if (existsSync(runtimes)) {
    for (const entry of readdirSync(runtimes)) {
      candidates.push(join(runtimes, entry, ...relative))
    }
  }
  return candidates.find((candidate) => existsSync(candidate))
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const spec = `link:${packageDir.replaceAll('\\', '/')}`
  manifest.dependencies = manifest.dependencies ?? {}

  if (manifest.dependencies[PACKAGE_NAME] === spec) {
    console.log(`already linked: ${PACKAGE_NAME} -> ${packageDir}`)
  } else if (dryRun) {
    console.log(`[dry-run] set dependencies["${PACKAGE_NAME}"] = "${spec}" in ${manifestPath}`)
  } else {
    const backup = `${manifestPath}.bak-${stamp()}`
    await copyFile(manifestPath, backup)
    if (existsSync(lockPath)) await copyFile(lockPath, `${lockPath}.bak-${stamp()}`)
    manifest.dependencies[PACKAGE_NAME] = spec
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    console.log(`wrote ${manifestPath} (backup: ${backup})`)
  }

  if (!dryRun) {
    const pnpm = findRuntimeBin('pnpm')
    if (pnpm === undefined) throw new Error('cannot find the bundled pnpm under $DSH_HOME/dsh-runtimes')
    const node = findRuntimeBin('node') ?? process.execPath
    console.log(`pnpm install in ${profileDir}`)
    const result = spawnSync(node, [pnpm, 'install'], { cwd: profileDir, stdio: 'inherit' })
    if (result.status !== 0) throw new Error(`pnpm install failed with exit code ${result.status}`)
  }

  const linkPath = join(profileDir, 'node_modules', PACKAGE_NAME)
  if (!existsSync(linkPath)) throw new Error(`link missing after install: ${linkPath}`)
  const landed = await realpath(linkPath).catch(() => linkPath)
  const landedManifest = JSON.parse(await readFile(join(linkPath, 'package.json'), 'utf8'))
  const patched = landedManifest.description?.includes('Route aliases') === true
  const clientHalf = landedManifest.dsh?.client !== undefined
  console.log(`linked: ${linkPath} -> ${landed}`)
  console.log(`patched adapter: ${patched ? 'yes' : 'NO — run tools/sync.mjs first'}`)
  console.log(`settings page: ${clientHalf ? 'yes' : 'NO — client.js/dsh.client missing'}`)
  if (!patched || !clientHalf) process.exitCode = 1
  console.log('\nRestart DSH Desktop to load the override and its Settings page.')
  console.log('After the restart, open Settings → Model aliases to create routes.')
  console.log('A route can also be added from the command line with:')
  console.log(`  node tools/add-route.mjs --profile ${profileName}`)
  console.log('(Running it before the restart also works, but the still-running old plugin')
  console.log(' reports one catalog diagnostic until the restart.)')
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
