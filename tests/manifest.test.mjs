import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (relative) => readFileSync(join(root, relative), 'utf8')
const manifest = JSON.parse(read('package.json'))
const adapter = read('lib/index.js')
const client = read('client.js')

test('package keeps the upstream adapter name and ships a Client half', () => {
  assert.equal(manifest.name, '@deepseek-ai/dsh-llm-pi-ai')
  assert.match(manifest.version, /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/)
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.main, 'lib/index.js')
  assert.equal(manifest.exports['.'], './lib/index.js')
  assert.equal(manifest.exports['./client'], './client.js')
  assert.equal(manifest.dsh?.client?.platform, 'web')
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-settings'))
  assert.equal(manifest.dsh?.bundle, undefined, 'a plain dependency overrides the bundled row')
  assert.ok(manifest.engines?.dsh)
})

test('every alias patch is present in the generated adapter', () => {
  const markers = [
    'catalog: z.string()',
    'names catalog',
    'catalogId = request.catalog ?? provider',
    '...source.catalog === void 0 ? {} : { catalog: source.catalog }',
    'catalogProvider(spec.catalog ?? spec.provider)',
    'catalogProvider(catalogId ?? provider)',
    'profile.catalogError, profile.catalog',
  ]
  for (const marker of markers) assert.ok(adapter.includes(marker), `missing patch marker: ${marker}`)
  assert.ok(adapter.includes('export { Config, PiAiAdapter, apply, inject, name, recordKeyFor, supportedProtocols };'))
})

test('route aliases resolve catalog metadata before route overrides', () => {
  assert.ok(
    adapter.includes(
      'const api = request.catalog !== void 0 ? base?.api ?? request.api ?? routeApi : request.api ?? base?.api ?? routeApi;',
    ),
  )
  assert.ok(
    adapter.includes(
      'const baseUrl = request.catalog !== void 0 ? base?.baseUrl ?? request.baseURL ?? providerBaseUrl : request.baseURL ?? base?.baseUrl ?? providerBaseUrl;',
    ),
  )
  assert.ok(
    adapter.includes(
      'if (catalog !== void 0 && (spec.catalog !== void 0 || spec.api === void 0)) return reuseCatalogProvider(catalog, spec);',
    ),
  )
})

test('runtime peers are declared but never installed', () => {
  assert.equal(manifest.dependencies, undefined)
  assert.ok(manifest.peerDependencies['@deepseek-ai/dsh-llm'])
  assert.ok(manifest.peerDependencies['@earendil-works/pi-ai'])
})

test('the Client module registers the settings section for this package id', () => {
  assert.match(client, /window\.__ModuleLoader__\.load/)
  assert.ok(client.includes(`id: '${manifest.name}'`))
  assert.match(client, /settings\.section/)
  assert.match(client, /remote\.settings/)
  assert.match(client, /remote\.credentials/)
  assert.match(client, /catalog/)
  assert.match(client, /ctx\.slots\.inject\(/)
  assert.match(client, /ctx\.locale\.register\(/)
})

test('locales carry display metadata', () => {
  for (const locale of ['locale/en.json', 'locale/zh.json']) {
    const dict = JSON.parse(read(locale))
    assert.ok(dict.meta?.title?.length > 0, `${locale} meta.title`)
    assert.ok(dict.meta?.description?.length > 0, `${locale} meta.description`)
  }
})

test('runtime and support files exist', () => {
  for (const file of [
    'lib/index.js',
    'client.js',
    'icon.svg',
    'LICENSE',
    'NOTICE.md',
    'README.md',
    'profile-patch.example.yml',
    'tools/sync.mjs',
    'tools/install.mjs',
    'tools/add-route.mjs',
  ]) {
    assert.ok(statSync(join(root, file)).size > 0, `${file} is empty or missing`)
  }
  for (const entry of ['client.js', 'lib/index.js', 'icon.svg', 'locale/*.json']) {
    assert.ok(manifest.files.includes(entry), `files[] covers ${entry}`)
  }
  assert.ok(read('icon.svg').length < 256 * 1024)
})
