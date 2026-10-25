#!/usr/bin/env node
/**
 * Regenerate the patched @deepseek-ai/dsh-llm-pi-ai package from the installed DSH build.
 *
 * The installed Harness ships this plugin inside resources/app.asar. We keep a
 * profile-local copy under the SAME package name, so the profile's pnpm-managed
 * package shadows the bundled one when the loader imports it. This script
 * rebuilds that copy from whatever DSH is currently installed, applies the
 * route-alias patch below, and writes package.json pinned to the installed
 * runtime versions.
 *
 * Usage:
 *   node tools/sync.mjs [--asar <path-to-app.asar>]
 *
 * Run it again after a DSH Desktop update, then restart the app.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const PLUGIN_PREFIX = 'dsh/node_modules/@deepseek-ai/dsh-llm-pi-ai/'

function argValue(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  const value = process.argv[index + 1]
  if (value === undefined) throw new Error(`${name} needs a value`)
  return value
}

const asarPath = resolve(
  argValue('--asar', 'G:\\programs\\DSH\\resources\\app.asar'),
)

/** Read the asar header and its data base offset. */
async function readAsarHeader(file) {
  const buffer = await readFile(file)
  const headerSize = buffer.readUInt32LE(4)
  const jsonLength = buffer.readUInt32LE(12)
  const jsonStart = 16
  const header = JSON.parse(buffer.subarray(jsonStart, jsonStart + jsonLength).toString('utf8'))
  return { buffer, header, dataBase: 8 + headerSize }
}

function* walk(node, prefix = '') {
  for (const [name, meta] of Object.entries(node.files ?? {})) {
    const path = prefix ? `${prefix}/${name}` : name
    if (meta.files) yield* walk(meta, path)
    else yield [path, meta]
  }
}

function findEntry(header, wanted) {
  for (const [path, meta] of walk(header)) {
    if (path === wanted) return meta
  }
  return undefined
}

const patches = [
  {
    label: 'config-schema: accept a route alias field',
    find: '\tdisplayName: z.string(),\n\tapi: z.union(supportedProtocols()),\n',
    replace:
      '\tdisplayName: z.string(),\n\tcatalog: z.string(),\n\tapi: z.union(supportedProtocols()),\n',
  },
  {
    label: 'resolveProfiles: validate the alias',
    find:
      '\t\tconst displayName = source.displayName ?? provider;\n\t\tlet catalog;\n',
    replace:
      '\t\tconst displayName = source.displayName ?? provider;\n' +
      '\t\tif (source.catalog !== void 0) {\n' +
      '\t\t\tif (source.catalog.length === 0) throw new Error(`llm-pi-ai: provider "${provider}" has an empty catalog`);\n' +
      '\t\t\tif (catalogProvider(source.catalog) === void 0) throw new Error(`llm-pi-ai: provider "${provider}" names catalog "${source.catalog}", which the installed pi-ai catalog does not serve`);\n' +
      '\t\t}\n' +
      '\t\tlet catalog;\n',
  },
  {
    label: 'resolveProfiles: hand the alias to route-model resolution',
    find:
      '\t\t\tcatalog = resolveRouteModels({\n\t\t\t\tprovider,\n\t\t\t\t...source.api === void 0 ? {} : { api: source.api },\n',
    replace:
      '\t\t\tcatalog = resolveRouteModels({\n\t\t\t\tprovider,\n\t\t\t\t...source.catalog === void 0 ? {} : { catalog: source.catalog },\n\t\t\t\t...source.api === void 0 ? {} : { api: source.api },\n',
  },
  {
    label: 'resolveProfiles: hand the alias to provider construction',
    find:
      '\t\t\tpiProvider = buildProvider({\n\t\t\t\tprovider,\n\t\t\t\tdisplayName,\n\t\t\t\t...source.api === void 0 ? {} : { api: source.api },\n',
    replace:
      '\t\t\tpiProvider = buildProvider({\n\t\t\t\tprovider,\n\t\t\t\tdisplayName,\n\t\t\t\t...source.catalog === void 0 ? {} : { catalog: source.catalog },\n\t\t\t\t...source.api === void 0 ? {} : { api: source.api },\n',
  },
  {
    label: 'resolveRouteModels: read the installed catalog through the alias',
    find:
      '\tconst { provider } = request;\n\tconst defaults = catalogModels(provider);\n\tconst providerBaseUrl = catalogProvider(provider)?.baseUrl;\n',
    replace:
      '\tconst { provider } = request;\n\tconst catalogId = request.catalog ?? provider;\n\tconst defaults = catalogModels(catalogId);\n\tconst providerBaseUrl = catalogProvider(catalogId)?.baseUrl;\n',
  },
  {
    label: 'resolveRouteModels: catalog metadata wins for alias models, route api is the fallback',
    find:
      '\t\tconst base = defaults.get(entry.id);\n\t\tconst api = request.api ?? base?.api ?? routeApi;\n',
    replace:
      '\t\tconst base = defaults.get(entry.id);\n\t\tconst api = request.catalog !== void 0 ? base?.api ?? request.api ?? routeApi : request.api ?? base?.api ?? routeApi;\n',
  },
  {
    label: 'resolveRouteModels: per-model catalog endpoint wins, route baseURL covers unknown models',
    find: '\t\tconst baseUrl = request.baseURL ?? base?.baseUrl ?? providerBaseUrl;\n',
    replace:
      '\t\tconst baseUrl = request.catalog !== void 0 ? base?.baseUrl ?? request.baseURL ?? providerBaseUrl : request.baseURL ?? base?.baseUrl ?? providerBaseUrl;\n',
  },
  {
    label: 'buildProvider: an alias always reuses the catalog provider\'s api table',
    find: '\tif (catalog !== void 0 && spec.api === void 0) return reuseCatalogProvider(catalog, spec);\n',
    replace:
      '\tif (catalog !== void 0 && (spec.catalog !== void 0 || spec.api === void 0)) return reuseCatalogProvider(catalog, spec);\n',
  },
  {
    label: 'buildProvider: reuse the aliased catalog provider',
    find: '\tconst catalog = catalogProvider(spec.provider);\n',
    replace: '\tconst catalog = catalogProvider(spec.catalog ?? spec.provider);\n',
  },
  {
    label: 'directoryEntries: describe the alias from its catalog provider',
    find:
      '\tconst declare = (provider, displayName, error) => {\n\t\tconst installed = catalogProvider(provider);\n',
    replace:
      '\tconst declare = (provider, displayName, error, catalogId) => {\n\t\tconst installed = catalogProvider(catalogId ?? provider);\n',
  },
  {
    label: 'directoryEntries: pass the declared alias through',
    find:
      '\tfor (const [provider, profile] of profiles) declare(provider, profile.displayName, profile.catalogError);\n',
    replace:
      '\tfor (const [provider, profile] of profiles) declare(provider, profile.displayName, profile.catalogError, profile.catalog);\n',
  },
]

function applyPatches(source) {
  let output = source
  for (const patch of patches) {
    const occurrences = output.split(patch.find).length - 1
    if (occurrences === 1) {
      output = output.replace(patch.find, patch.replace)
      console.log(`patched: ${patch.label}`)
    } else if (occurrences === 0 && output.includes(patch.replace)) {
      console.log(`already patched: ${patch.label}`)
    } else {
      throw new Error(
        `${patch.label}: expected exactly one anchor, found ${occurrences}. ` +
          'The installed dsh-llm-pi-ai build changed; update tools/sync.mjs.',
      )
    }
  }
  for (const patch of patches) {
    if (!output.includes(patch.replace)) throw new Error(`verify failed: ${patch.label}`)
  }
  return output
}

async function main() {
  const { buffer, header, dataBase } = await readAsarHeader(asarPath)
  const readText = (relative) => {
    const meta = findEntry(header, `${PLUGIN_PREFIX}${relative}`)
    if (meta === undefined) throw new Error(`not found in ${asarPath}: ${PLUGIN_PREFIX}${relative}`)
    if (meta.unpacked) throw new Error(`${relative} is unpacked; not supported`)
    const start = dataBase + Number(meta.offset)
    return buffer.subarray(start, start + meta.size).toString('utf8')
  }

  const source = readText('lib/index.js')
  const sourceManifest = JSON.parse(readText('package.json'))
  const patched = applyPatches(source)

  await mkdir(join(root, 'lib'), { recursive: true })
  await writeFile(join(root, 'lib', 'index.js'), patched)
  await writeFile(join(root, 'lib', 'index.js.orig'), source)

  // Every import of the shipped build is supplied by the running installation's
  // runtime resolution, so the local copy declares those packages as peers
  // (never installed) and drops the shipped dependency block.
  //
  // Runtime peers are widened to the installed minor: a DSH update within 0.2.x
  // keeps the override loading (it may need a re-sync), while a 0.3.x update
  // makes the composition refuse it instead of running old adapter code against
  // a changed seam. Re-run this script after every DSH update.
  const peers = {
    ...sourceManifest.dependencies,
    ...sourceManifest.peerDependencies,
  }
  for (const name of Object.keys(peers)) {
    if (name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-')) {
      peers[name] = `^${sourceManifest.version}`
    }
  }
  const manifest = {
    name: sourceManifest.name,
    version: sourceManifest.version,
    private: true,
    description:
      'Route aliases for DeepSeek Harness pi-ai: the bundled @deepseek-ai/dsh-llm-pi-ai adapter, extended so a route may name another installed catalog as `catalog` (several credential routes over one provider catalog, e.g. multiple OpenCode Go plans), with a Settings page to manage them.',
    license: sourceManifest.license ?? 'MIT',
    type: sourceManifest.type,
    main: sourceManifest.main,
    engines: { dsh: `^${sourceManifest.version}` },
    exports: {
      '.': './lib/index.js',
      './client': './client.js',
      './package.json': './package.json',
      './locale/*.json': './locale/*.json',
      './icon': './icon.svg',
    },
    files: [
      'lib/index.js',
      'client.js',
      'locale/*.json',
      'icon.svg',
      'LICENSE',
      'NOTICE.md',
      'README.md',
      'profile-patch.example.yml',
      'tools/*.mjs',
    ],
    dsh: {
      client: {
        platform: 'web',
        immediately: true,
        inject: ['@deepseek-ai/dsh-client-ui-settings'],
      },
    },
    scripts: {
      sync: 'node tools/sync.mjs',
      install: 'node tools/install.mjs',
      test: 'node --test tests/manifest.test.mjs',
    },
    keywords: [
      'deepseek-harness',
      'dsh',
      'dsh-plugin',
      'pi-ai',
      'provider-aliases',
      'opencode-go',
    ],
    peerDependencies: peers,
    peerDependenciesMeta: sourceManifest.peerDependenciesMeta,
    repository: {
      type: 'git',
      url: 'git+https://github.com/Dax233/dsh-provider-aliases.git',
    },
    homepage: 'https://github.com/Dax233/dsh-provider-aliases#readme',
    bugs: {
      url: 'https://github.com/Dax233/dsh-provider-aliases/issues',
    },
  }
  await writeFile(join(root, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`wrote package.json for ${manifest.name}@${manifest.version}`)
  console.log(`source build: ${asarPath}`)
  console.log('\nNext: node tools/install.mjs   (then restart DSH Desktop)')
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
