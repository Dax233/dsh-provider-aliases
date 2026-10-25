/**
 * Provider Aliases — a Settings section beside Models, shipped inside the
 * `@deepseek-ai/dsh-llm-pi-ai` route-alias package itself.
 *
 * An installed pi-ai catalog provider can serve several credential routes once
 * each extra route names that catalog through the `catalog` field (provided by
 * this package's Host half). This page creates, renames and removes those
 * routes and stores each route's API key, so a user can attach any number of
 * subscriptions (for example several OpenCode Go plans) without editing
 * cordis.patch.yml by hand.
 *
 * Everything goes through the browser's existing seams: the `llm-pi-ai`
 * settings namespace (read/describe + mutate with a revision) and the
 * credential Remote for keys. The page never invents a transport of its own.
 */
window.__ModuleLoader__.load({
  id: '@deepseek-ai/dsh-llm-pi-ai',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Dictionary namespace owned by this plugin. */
    const NS = 'provider-aliases'
    /** Host settings namespace shared with the Models page. */
    const SETTINGS_NS = 'llm-pi-ai'
    /** Route ids follow the pi-ai settings-key grammar. */
    const ROUTE_PATTERN = /^[a-z][a-z0-9-]*$/
    /** Credential references are POSIX-identifier shaped. */
    const KEY_REF_PATTERN = /^[A-Z][A-Z0-9_]*$/
    /** Friendly labels for the catalogs people alias most often. */
    const CATALOG_LABELS = {
      'opencode-go': 'OpenCode Go',
      opencode: 'OpenCode Zen',
      openrouter: 'OpenRouter',
      anthropic: 'Anthropic',
      openai: 'OpenAI',
      'openai-codex': 'OpenAI Codex',
      deepseek: 'DeepSeek',
      google: 'Google',
      'google-vertex': 'Google Vertex',
      moonshotai: 'Moonshot',
      'moonshotai-cn': 'Moonshot (CN)',
      zai: 'Z.AI',
      'zai-coding-cn': 'Z.AI Coding (CN)',
      xai: 'xAI',
      mistral: 'Mistral',
      groq: 'Groq',
      together: 'Together',
      fireworks: 'Fireworks',
      cerebras: 'Cerebras',
      nvidia: 'NVIDIA',
      minimax: 'MiniMax',
      'minimax-cn': 'MiniMax (CN)',
      'qwen-token-plan': 'Qwen Token Plan',
      'qwen-token-plan-cn': 'Qwen Token Plan (CN)',
      'xiaomi-token-plan-sgp': 'Xiaomi Token Plan',
      'kimi-coding': 'Kimi Coding',
      huggingface: 'Hugging Face',
      'github-copilot': 'GitHub Copilot',
      vercel: 'Vercel AI Gateway',
      'vercel-ai-gateway': 'Vercel AI Gateway',
      cloudflare: 'Cloudflare',
      'cloudflare-ai-gateway': 'Cloudflare AI Gateway',
      'cloudflare-workers-ai': 'Cloudflare Workers AI',
      azure: 'Azure OpenAI',
      bedrock: 'Amazon Bedrock',
      'amazon-bedrock': 'Amazon Bedrock',
      radius: 'Radius',
      baseten: 'Baseten',
      meta: 'Meta',
      typeSafe: 'TypeSafe',
      typesafe: 'TypeSafe',
    }

    const zh = {
      nav: '模型别名',
      title: '模型别名',
      intro:
        '一个内置模型目录可以挂多条凭据路由：每条别名复用目录的模型、协议与推理档位，只使用自己的 API Key。适合多个 OpenCode Go 套餐或同一厂商的多个账号。',
      readOnly: '当前设置为只读，修改不会被保存。',
      patchMissing:
        '当前 llm-pi-ai 适配器还不支持 catalog 别名。请先安装 dsh-llm-pi-ai-multi 覆盖包并重启 DSH，再回来创建别名。',
      loadFailed: '加载失败',
      retry: '重试',
      loading: '正在读取设置…',
      aliasesHeading: '已配置的别名',
      noAliases: '还没有别名。在下方选择一个目录 provider，创建第一条。',
      aliasTag: '别名',
      catalogRoute: '目录 route',
      customRoute: '自定义 route',
      unregistered: '未注册',
      modelsChip: '个模型',
      keyConfigured: 'Key 已配置',
      keyMissing: 'Key 未配置',
      keyInputLabel: 'API Key',
      keyPlaceholder: '粘贴这条路由要使用的 Key',
      saveKey: '保存 Key',
      saving: '保存中…',
      clearKey: '清除 Key',
      removeAlias: '移除别名',
      confirmRemove: '确认移除',
      cancel: '取消',
      saved: '已保存',
      nameLabel: '别名名称',
      addTitle: '添加别名',
      addIntro: '选择要复用的目录 provider。新 route 会继承它的全部模型与推理档位，Key 单独配置。',
      catalogLabel: '目录 provider',
      chooseCatalog: '选择一个目录 provider',
      routeLabel: 'Route ID',
      routePlaceholder: '例如 opencode-go-2',
      routeHint: '小写字母、数字和连字符；它会出现在模型选择器与凭据名里。',
      displayNameLabel: '显示名称',
      displayNamePlaceholder: '可选，例如 OpenCode Go 二套',
      keyRefLabel: '凭据引用',
      keyRefHint: 'Key 会存到这个引用名下，例如 OPENCODE_GO_SEORI_API_KEY。',
      create: '创建别名',
      creating: '创建中…',
      invalidCatalog: '请选择一个目录 provider。',
      invalidRoute: 'Route ID 只能包含小写字母、数字和连字符，且以小写字母开头。',
      routeTaken: '这个 Route ID 已被占用。',
      invalidKeyRef: '凭据引用只能包含大写字母、数字和下划线，且以字母开头。',
      othersHeading: '其他 route',
      othersHint: '由 Models 页或 cordis.patch.yml 管理，不在此页修改。',
      errorPrefix: '操作失败：',
      keyRefChip: '凭据',
    }

    const en = {
      nav: 'Model aliases',
      title: 'Model aliases',
      intro:
        'One installed model catalog can serve several credential routes: each alias reuses the catalog models, wire protocols and reasoning levels, and brings its own API key. Useful for multiple OpenCode Go plans or several accounts of the same vendor.',
      readOnly: 'Settings are read-only right now; changes will not be saved.',
      patchMissing:
        'This llm-pi-ai adapter does not support catalog aliases yet. Install the dsh-llm-pi-ai-multi override and restart DSH, then come back.',
      loadFailed: 'Could not load settings',
      retry: 'Retry',
      loading: 'Loading settings…',
      aliasesHeading: 'Configured aliases',
      noAliases: 'No aliases yet. Pick a catalog provider below to create the first one.',
      aliasTag: 'alias',
      catalogRoute: 'catalog route',
      customRoute: 'custom route',
      unregistered: 'unregistered',
      modelsChip: 'models',
      keyConfigured: 'Key configured',
      keyMissing: 'Key missing',
      keyInputLabel: 'API Key',
      keyPlaceholder: 'Paste the key this route should use',
      saveKey: 'Save key',
      saving: 'Saving…',
      clearKey: 'Clear key',
      removeAlias: 'Remove alias',
      confirmRemove: 'Confirm remove',
      cancel: 'Cancel',
      saved: 'Saved',
      nameLabel: 'Alias name',
      addTitle: 'Add an alias',
      addIntro:
        'Pick the catalog provider to reuse. The new route inherits all of its models and reasoning levels; the key is configured separately.',
      catalogLabel: 'Catalog provider',
      chooseCatalog: 'Choose a catalog provider',
      routeLabel: 'Route ID',
      routePlaceholder: 'e.g. opencode-go-2',
      routeHint: 'Lowercase letters, digits and hyphens; it appears in the model picker and credential name.',
      displayNameLabel: 'Display name',
      displayNamePlaceholder: 'Optional, e.g. OpenCode Go second plan',
      keyRefLabel: 'Credential reference',
      keyRefHint: 'The key is stored under this reference, e.g. OPENCODE_GO_SEORI_API_KEY.',
      create: 'Create alias',
      creating: 'Creating…',
      invalidCatalog: 'Choose a catalog provider.',
      invalidRoute: 'Route ID must start with a lowercase letter and contain only lowercase letters, digits and hyphens.',
      routeTaken: 'That Route ID is already taken.',
      invalidKeyRef: 'Credential reference must start with a letter and contain only uppercase letters, digits and underscores.',
      othersHeading: 'Other routes',
      othersHint: 'Managed from the Models page or cordis.patch.yml; editing here is read-only.',
      errorPrefix: 'Action failed: ',
      keyRefChip: 'credential',
    }

    const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
    const catalogLabel = (id) => CATALOG_LABELS[id] || id
    const deriveKeyRef = (route) =>
      `${String(route).toUpperCase().replace(/[^A-Z0-9]/g, '_')}_API_KEY`
    const keyRefOf = (route, profile) =>
      isRecord(profile) && typeof profile.apiKeyEnv === 'string' && profile.apiKeyEnv.length > 0
        ? profile.apiKeyEnv
        : deriveKeyRef(route)

    /**
     * Whether the running adapter understands `catalog` routes, judged from the
     * provider directory: a catalog alias route is registered like an installed
     * catalog provider (declared false, catalog defaults attached). An adapter
     * without the override reports the same route as hand-declared with no
     * models. No alias route exists yet, so nothing can contradict the feature
     * and the page stays optimistic; a refused create falls back to the banner.
     */
    function aliasesSupported(providers, directory) {
      const aliasRoutes = Object.entries(providers)
        .filter(([, profile]) => isRecord(profile) && typeof profile.catalog === 'string')
        .map(([route]) => route)
      if (aliasRoutes.length === 0) return true
      const byProvider = new Map(directory.map((entry) => [entry.provider, entry]))
      return aliasRoutes.every((route) => {
        const entry = byProvider.get(route)
        return entry !== undefined && entry.declared !== true
      })
    }

    /** Poll a route id nobody uses yet. */
    function suggestAlias(providers, catalog) {
      if (providers[catalog] === undefined) {
        return { route: catalog, displayName: catalogLabel(catalog), keyRef: deriveKeyRef(catalog) }
      }
      let index = 2
      while (providers[`${catalog}-${index}`] !== undefined) index += 1
      const route = `${catalog}-${index}`
      return { route, displayName: `${catalogLabel(catalog)} ${index}`, keyRef: deriveKeyRef(route) }
    }

    /**
     * Page state: the joined `llm-pi-ai` settings view plus the provider
     * directory and credential presence. Writes carry the view revision, and a
     * conflict or refusal reloads the truth before reporting.
     */
    function createAliasesStore(ctx) {
      let snapshot = {
        status: 'idle',
        error: null,
        savedAt: 0,
        busy: false,
        writable: false,
        revision: void 0,
        providers: {},
        userProviders: {},
        directory: [],
        patchReady: false,
        credentials: {},
      }
      const listeners = new Set()
      const emit = () => {
        for (const listener of [...listeners]) listener()
      }
      const set = (patch) => {
        snapshot = { ...snapshot, ...patch }
        emit()
      }
      const getSnapshot = () => snapshot
      const subscribe = (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      }

      let inFlight
      async function refreshCredentials() {
        const refs = [...new Set(Object.entries(snapshot.providers).map(([route, profile]) => keyRefOf(route, profile)))]
        if (refs.length === 0) {
          set({ credentials: {} })
          return
        }
        const map = {}
        for (let index = 0; index < refs.length; index += 64) {
          const response = await ctx.remote.credentials.describe(refs.slice(index, index + 64))
          if (response.ok) Object.assign(map, response.value)
        }
        set({ credentials: map })
      }

      async function load() {
        if (inFlight !== void 0) return inFlight
        const pending = (async () => {
          try {
            const [described, directory] = await Promise.all([
              ctx.remote.settings.describe(),
              ctx.remote.llm.listConfigurableProviders(),
            ])
            if (!described.ok) throw new Error(described.error?.message ?? 'settings describe failed')
            if (!directory.ok) throw new Error(directory.error?.message ?? 'provider directory failed')
            const view = (described.value.namespaces ?? []).find((candidate) => candidate.ns === SETTINGS_NS)
            if (view === void 0) throw new Error(`settings namespace "${SETTINGS_NS}" is not served`)
            const providers = isRecord(view.value?.providers) ? view.value.providers : {}
            const userProviders = isRecord(view.user?.providers) ? view.user.providers : {}
            const entries = directory.value.filter((entry) => entry.settingsNs === SETTINGS_NS)
            set({
              status: 'ready',
              error: null,
              writable: described.value.writable !== false,
              revision: view.revision,
              providers,
              userProviders,
              directory: entries,
              patchReady: aliasesSupported(providers, entries),
            })
            await refreshCredentials()
          } catch (error) {
            set({ status: 'error', error: String(error?.message ?? error) })
          } finally {
            inFlight = void 0
          }
        })()
        inFlight = pending
        set({ status: snapshot.status === 'ready' ? 'ready' : 'loading' })
        return pending
      }

      async function write(ops) {
        set({ busy: true })
        try {
          const response = await ctx.remote.settings.mutate(SETTINGS_NS, ops, snapshot.revision)
          if (!response.ok) {
            await load()
            return { ok: false, message: response.error?.message ?? response.error?.code ?? 'write refused' }
          }
          await load()
          set({ savedAt: Date.now() })
          return { ok: true }
        } catch (error) {
          await load().catch(() => {})
          return { ok: false, message: String(error?.message ?? error) }
        } finally {
          set({ busy: false })
        }
      }

      return {
        getSnapshot,
        subscribe,
        load,
        async createAlias(input) {
          const profile = { catalog: input.catalog }
          if (input.displayName.length > 0) profile.displayName = input.displayName
          profile.apiKeyEnv = input.keyRef
          return write([{ op: 'set', path: ['providers', input.route], value: profile }])
        },
        async renameAlias(route, name) {
          const trimmed = name.trim()
          const ops =
            trimmed.length === 0
              ? [{ op: 'unset', path: ['providers', route, 'displayName'] }]
              : [{ op: 'set', path: ['providers', route, 'displayName'], value: trimmed }]
          return write(ops)
        },
        async deleteAlias(route) {
          return write([{ op: 'unset', path: ['providers', route] }])
        },
        async saveKey(route, ref, value) {
          const profile = snapshot.providers[route]
          if (!isRecord(profile) || typeof profile.apiKeyEnv !== 'string' || profile.apiKeyEnv.length === 0) {
            const wrote = await write([{ op: 'set', path: ['providers', route, 'apiKeyEnv'], value: ref }])
            if (!wrote.ok) return wrote
          }
          try {
            const response = await ctx.remote.credentials.set(ref, value)
            if (!response.ok) return { ok: false, message: response.error?.message ?? 'credential write refused' }
            await load()
            set({ savedAt: Date.now() })
            return { ok: true }
          } catch (error) {
            return { ok: false, message: String(error?.message ?? error) }
          }
        },
        async clearKey(ref) {
          try {
            const response = await ctx.remote.credentials.unset(ref)
            if (!response.ok) return { ok: false, message: response.error?.message ?? 'credential clear refused' }
            await load()
            set({ savedAt: Date.now() })
            return { ok: true }
          } catch (error) {
            return { ok: false, message: String(error?.message ?? error) }
          }
        },
      }
    }

    const CSS = `
.pa_section{max-width:720px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:12px}
.pa_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}
.pa_intro{color:var(--dsw-alias-label-secondary);margin:0;font-size:14px;line-height:22px}
.pa_subtitle{color:var(--dsw-alias-label-secondary);margin:12px 0 0;font-size:12px;font-weight:500;line-height:18px;text-transform:uppercase;letter-spacing:.04em}
.pa_notice{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-label-secondary));margin:0;font-size:12px;line-height:18px}
.pa_error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px;word-break:break-word}
.pa_saved{color:var(--dsw-alias-state-success-primary);margin:0;font-size:12px;line-height:18px}
.pa_rows{flex-direction:column;gap:8px;margin:12px 0 0;padding:0;list-style:none;display:flex}
.pa_empty{border:.5px dashed var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-lg,12px);color:var(--dsw-alias-label-tertiary);margin:12px 0 0;padding:14px;font-size:13px;line-height:20px}
.pa_card{border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l2));background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1));border-radius:var(--dsw-radius-xl,14px);flex-direction:column;gap:10px;padding:12px 14px;display:flex}
.pa_head{align-items:center;gap:10px;min-width:0;display:flex}
.pa_nameInput{box-sizing:border-box;flex:1 1 auto;min-width:0;font:inherit;font-size:14px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-primary);background:0 0;border:.5px solid transparent;border-radius:var(--dsw-radius-sm,6px);margin-left:-6px;padding:2px 6px}
.pa_nameInput:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2))}
.pa_nameInput:focus{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline:none}
.pa_nameInput:disabled{opacity:.7}
.pa_chip{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-xs,4px);color:var(--dsw-alias-label-secondary);flex:none;white-space:nowrap;padding:1px 6px;font-size:11px;line-height:16px}
.pa_chipMono{font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:11px}
.pa_dot{border-radius:50%;flex:none;width:8px;height:8px}
.pa_dotOk{background:var(--dsw-alias-state-success-primary)}
.pa_dotMissing{background:var(--dsw-alias-state-error-primary)}
.pa_dotUnknown{background:var(--dsw-alias-state-idle-primary)}
.pa_meta{align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);display:flex}
.pa_code{font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:11px;color:var(--dsw-alias-label-secondary)}
.pa_keyRow{align-items:center;gap:8px;flex-wrap:wrap;display:flex}
.pa_input{box-sizing:border-box;flex:1 1 220px;min-width:0;height:32px;border:.5px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l3));border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;padding:0 10px}
.pa_input:focus{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline:none}
.pa_input::placeholder{color:var(--dsw-alias-label-dimmed,var(--dsw-alias-label-tertiary))}
.pa_input:disabled{opacity:.6}
.pa_select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-position:right 10px center;background-repeat:no-repeat;background-size:12px 12px;padding-right:30px;cursor:pointer}
.pa_button{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-md,8px);height:32px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;justify-content:center;align-items:center;gap:4px;padding:0 12px;font-size:13px;line-height:20px;white-space:nowrap;display:inline-flex}
.pa_button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.pa_button:disabled{opacity:.45;cursor:default}
.pa_button:focus-visible,.pa_input:focus-visible,.pa_nameInput:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.pa_primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}
.pa_primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary))}
.pa_danger{color:var(--dsw-alias-state-error-primary)}
.pa_danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,rgba(213,104,104,.12))}
.pa_details{border-top:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));padding-top:10px}
.pa_summary{width:fit-content;cursor:pointer;color:var(--dsw-alias-label-secondary);align-items:center;gap:6px;font-size:12px;font-weight:500;line-height:18px;list-style:none;display:flex}
.pa_summary::-webkit-details-marker{display:none}
.pa_summary:before{content:"";border-bottom:1.5px solid;border-right:1.5px solid;width:5px;height:5px;transition:transform .12s;transform:rotate(-45deg)}
.pa_details[open]>.pa_summary:before{transform:rotate(45deg)}
.pa_otherList{flex-direction:column;gap:6px;margin:8px 0 0;padding:0;list-style:none;display:flex}
.pa_otherRow{align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);display:flex}
.pa_addCard{border:.5px dashed var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-xl,14px);flex-direction:column;gap:12px;margin-top:14px;padding:14px 16px;display:flex}
.pa_addTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}
.pa_addIntro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.pa_addGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px;display:grid}
.pa_field{flex-direction:column;gap:6px;min-width:0;display:flex}
.pa_field .pa_input{flex:none;width:100%}
.pa_label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}
.pa_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.pa_fieldError{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}
.pa_actions{justify-content:flex-end;gap:8px;display:flex}
.pa_cardActions{justify-content:flex-end;gap:8px;display:flex}
.pa_rowError{margin:0;font-size:12px;line-height:18px}
@media(max-width:560px){.pa_addGrid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.pa_summary:before{transition:none}}
`

    /** One configured alias card: name, catalog chip, key state and removal. */
    function AliasCard({ t, store, route, profile, directoryEntry, credential, writable, busy, report }) {
      const [nameDraft, setNameDraft] = React.useState(profile.displayName || route)
      const [keyDraft, setKeyDraft] = React.useState('')
      const [confirming, setConfirming] = React.useState(false)
      const [localError, setLocalError] = React.useState('')
      const [localBusy, setLocalBusy] = React.useState(false)
      const keyRef = keyRefOf(route, profile)
      const configured = credential?.configured === true
      const single = React.useId()
      const keyId = `${single}-key`
      const catalog = typeof profile.catalog === 'string' ? profile.catalog : ''
      const modelCount = Array.isArray(profile.models) ? profile.models.length : 0

      React.useEffect(() => {
        setNameDraft(profile.displayName || route)
      }, [profile.displayName, route])

      const disabled = busy || localBusy || !writable
      const commitName = async () => {
        if (disabled) return
        const next = nameDraft.trim()
        if (next === (profile.displayName || '')) return
        setLocalBusy(true)
        setLocalError('')
        const result = await store.renameAlias(route, next)
        setLocalBusy(false)
        if (!result.ok) setLocalError(result.message)
        else report(t('saved'))
      }
      const saveKey = async () => {
        if (disabled || keyDraft.trim().length === 0) return
        setLocalBusy(true)
        setLocalError('')
        const result = await store.saveKey(route, keyRef, keyDraft.trim())
        setLocalBusy(false)
        if (!result.ok) setLocalError(result.message)
        else {
          setKeyDraft('')
          report(t('saved'))
        }
      }
      const clearKey = async () => {
        if (disabled) return
        setLocalBusy(true)
        setLocalError('')
        const result = await store.clearKey(keyRef)
        setLocalBusy(false)
        if (!result.ok) setLocalError(result.message)
        else report(t('saved'))
      }
      const remove = async () => {
        if (!confirming) {
          setConfirming(true)
          return
        }
        setLocalBusy(true)
        setLocalError('')
        const result = await store.deleteAlias(route)
        setLocalBusy(false)
        if (!result.ok) {
          setConfirming(false)
          setLocalError(result.message)
        }
      }
      return h(
        'li',
        { className: 'pa_card', 'data-provider-alias': route },
        h(
          'div',
          { className: 'pa_head' },
          h('span', {
            className: `pa_dot ${configured ? 'pa_dotOk' : 'pa_dotMissing'}`,
            title: configured ? t('keyConfigured') : t('keyMissing'),
            'aria-label': configured ? t('keyConfigured') : t('keyMissing'),
          }),
          h('input', {
            className: 'pa_nameInput',
            value: nameDraft,
            disabled,
            'aria-label': t('nameLabel'),
            onChange: (event) => setNameDraft(event.target.value),
            onBlur: commitName,
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.blur()
              }
              if (event.key === 'Escape') setNameDraft(profile.displayName || route)
            },
          }),
          h('span', { className: 'pa_chip pa_chipMono', title: `${t('catalogLabel')}: ${catalog}` }, catalog),
          modelCount > 0 ? h('span', { className: 'pa_chip' }, `${modelCount} ${t('modelsChip')}`) : null,
        ),
        h(
          'div',
          { className: 'pa_meta' },
          h('span', {}, `route `, h('code', { className: 'pa_code' }, route)),
          configured
            ? h('span', {}, t('keyConfigured'), ' · ', h('code', { className: 'pa_code' }, keyRef))
            : h('span', {}, t('keyMissing'), ' · ', h('code', { className: 'pa_code' }, keyRef)),
          directoryEntry?.error === undefined ? null : h('span', { className: 'pa_error' }, directoryEntry.error),
        ),
        h(
          'div',
          { className: 'pa_keyRow' },
          h('input', {
            className: 'pa_input',
            id: keyId,
            type: 'password',
            autoComplete: 'new-password',
            spellCheck: false,
            placeholder: t('keyPlaceholder'),
            'aria-label': `${t('keyInputLabel')} — ${route}`,
            value: keyDraft,
            disabled,
            onChange: (event) => setKeyDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveKey()
              }
            },
          }),
          h('button', { type: 'button', className: 'pa_button pa_primary', disabled: disabled || keyDraft.trim().length === 0, onClick: saveKey }, localBusy ? t('saving') : t('saveKey')),
          configured
            ? h('button', { type: 'button', className: 'pa_button', disabled, onClick: clearKey }, t('clearKey'))
            : null,
        ),
        localError.length > 0 ? h('p', { className: 'pa_rowError pa_error', role: 'alert' }, localError) : null,
        h(
          'div',
          { className: 'pa_cardActions' },
          confirming
            ? h('button', { type: 'button', className: 'pa_button', disabled: localBusy, onClick: () => setConfirming(false) }, t('cancel'))
            : null,
          h('button', { type: 'button', className: `pa_button pa_danger`, disabled, onClick: remove }, confirming ? t('confirmRemove') : t('removeAlias')),
        ),
      )
    }

    /** Compact row for routes this page does not own. */
    function OtherRow({ t, route, profile, directoryEntry }) {
      const tag =
        directoryEntry === undefined
          ? t('unregistered')
          : directoryEntry.declared === true
            ? t('customRoute')
            : t('catalogRoute')
      const keyRef = keyRefOf(route, profile)
      return h(
        'li',
        { className: 'pa_otherRow' },
        h('code', { className: 'pa_code' }, route),
        h('span', { className: 'pa_chip' }, tag),
        h('span', { className: 'pa_code' }, keyRef),
      )
    }

    function AliasesBody({ t, store }) {
      const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
      React.useEffect(() => {
        store.load()
      }, [store])
      const [draft, setDraft] = React.useState(null)
      const [formError, setFormError] = React.useState('')
      const [savedText, setSavedText] = React.useState('')
      const [creating, setCreating] = React.useState(false)
      const [patchHint, setPatchHint] = React.useState(false)

      const providers = snapshot.providers
      const directoryByProvider = new Map(snapshot.directory.map((entry) => [entry.provider, entry]))
      const aliasRows = Object.entries(providers).filter(
        ([, profile]) => isRecord(profile) && typeof profile.catalog === 'string',
      )
      const otherRows = Object.entries(providers).filter(
        ([, profile]) => !(isRecord(profile) && typeof profile.catalog === 'string'),
      )
      const catalogOptions = [...new Set(
        snapshot.directory
          .filter((entry) => entry.settingsNs === SETTINGS_NS)
          .filter((entry) => entry.declared !== true)
          .filter((entry) => !(isRecord(providers[entry.provider]) && typeof providers[entry.provider].catalog === 'string'))
          .map((entry) => entry.provider),
      )].sort((left, right) => left.localeCompare(right))

      const preferredCatalog =
        catalogOptions.includes('opencode-go') ? 'opencode-go' : catalogOptions[0]

      React.useEffect(() => {
        if (draft !== null || preferredCatalog === undefined) return
        const suggestion = suggestAlias(providers, preferredCatalog)
        setDraft({
          catalog: preferredCatalog,
          route: suggestion.route,
          displayName: suggestion.displayName,
          keyRef: suggestion.keyRef,
        })
      }, [draft, preferredCatalog, providers])

      const report = (text) => {
        setSavedText(text)
        setFormError('')
      }

      const updateCatalog = (catalog) => {
        const suggestion = suggestAlias(providers, catalog)
        setDraft({ catalog, route: suggestion.route, displayName: suggestion.displayName, keyRef: suggestion.keyRef })
        setFormError('')
      }

      const submit = async (event) => {
        event.preventDefault()
        if (draft === null) return
        const catalog = draft.catalog
        const route = draft.route.trim()
        const keyRef = draft.keyRef.trim()
        if (catalog.length === 0) {
          setFormError(t('invalidCatalog'))
          return
        }
        if (!ROUTE_PATTERN.test(route)) {
          setFormError(t('invalidRoute'))
          return
        }
        if (providers[route] !== undefined) {
          setFormError(t('routeTaken'))
          return
        }
        if (!KEY_REF_PATTERN.test(keyRef)) {
          setFormError(t('invalidKeyRef'))
          return
        }
        setCreating(true)
        setFormError('')
        const result = await store.createAlias({ route, catalog, displayName: draft.displayName.trim(), keyRef })
        setCreating(false)
        if (!result.ok) {
          if (/resolves no models|does not describe this route|catalog/i.test(result.message)) {
            setPatchHint(true)
            setFormError(t('patchMissing'))
          } else setFormError(result.message)
          return
        }
        setPatchHint(false)
        const suggestion = suggestAlias(store.getSnapshot().providers, catalog)
        setDraft({ catalog, route: suggestion.route, displayName: suggestion.displayName, keyRef: suggestion.keyRef })
        report(t('saved'))
      }

      const disabled = snapshot.busy || creating || !snapshot.writable
      const patchMissing = !snapshot.patchReady || patchHint
      const header = [
        h('h2', { className: 'pa_title', key: 'title' }, t('title')),
        h('p', { className: 'pa_intro', key: 'intro' }, t('intro')),
      ]
      if (snapshot.status === 'error') {
        return h(
          'div',
          { className: 'pa_section', 'data-provider-aliases': 'error' },
          h('style', null, CSS),
          ...header,
          h('p', { className: 'pa_error', role: 'alert' }, `${t('loadFailed')}: ${snapshot.error ?? ''}`),
          h(
            'div',
            { className: 'pa_actions' },
            h('button', { type: 'button', className: 'pa_button', onClick: () => store.load() }, t('retry')),
          ),
        )
      }
      if (snapshot.status !== 'ready') {
        return h(
          'div',
          { className: 'pa_section', 'data-provider-aliases': 'loading' },
          h('style', null, CSS),
          ...header,
          h('p', { className: 'pa_hint' }, t('loading')),
        )
      }
      return h(
        'div',
        { className: 'pa_section', 'data-provider-aliases': 'ready' },
        h('style', null, CSS),
        ...header,
        snapshot.writable ? null : h('p', { className: 'pa_notice', role: 'status' }, t('readOnly')),
        patchMissing ? h('p', { className: 'pa_notice', role: 'alert', 'data-provider-aliases-patch': 'missing' }, t('patchMissing')) : null,
        savedText.length > 0 ? h('p', { className: 'pa_saved', role: 'status', 'aria-live': 'polite' }, savedText) : null,
        h('h3', { className: 'pa_subtitle' }, t('aliasesHeading')),
        aliasRows.length === 0
          ? h('p', { className: 'pa_empty' }, t('noAliases'))
          : h(
              'ul',
              { className: 'pa_rows' },
              ...aliasRows.map(([route, profile]) =>
                h(AliasCard, {
                  key: route,
                  t,
                  store,
                  route,
                  profile,
                  directoryEntry: directoryByProvider.get(route),
                  credential: snapshot.credentials[keyRefOf(route, profile)],
                  writable: snapshot.writable,
                  busy: snapshot.busy,
                  report,
                }),
              ),
            ),
        otherRows.length === 0
          ? null
          : h(
              'details',
              { className: 'pa_details' },
              h('summary', { className: 'pa_summary' }, `${t('othersHeading')} · ${otherRows.length}`),
              h('p', { className: 'pa_hint' }, t('othersHint')),
              h(
                'ul',
                { className: 'pa_otherList' },
                ...otherRows.map(([route, profile]) =>
                  h(OtherRow, { key: route, t, route, profile, directoryEntry: directoryByProvider.get(route) }),
                ),
              ),
            ),
        h(
          'form',
          { className: 'pa_addCard', onSubmit: submit, 'data-provider-aliases-add': 'true' },
          h('h3', { className: 'pa_addTitle' }, t('addTitle')),
          h('p', { className: 'pa_addIntro' }, t('addIntro')),
          h(
            'div',
            { className: 'pa_addGrid' },
            h(
              'label',
              { className: 'pa_field' },
              h('span', { className: 'pa_label' }, t('catalogLabel')),
              h(
                'select',
                {
                  className: 'pa_input pa_select',
                  value: draft?.catalog ?? '',
                  disabled,
                  onChange: (event) => updateCatalog(event.target.value),
                },
                ...catalogOptions.map((catalog) =>
                  h('option', { key: catalog, value: catalog }, `${catalogLabel(catalog)} · ${catalog}`),
                ),
              ),
            ),
            h(
              'label',
              { className: 'pa_field' },
              h('span', { className: 'pa_label' }, t('routeLabel')),
              h('input', {
                className: 'pa_input',
                value: draft?.route ?? '',
                disabled,
                placeholder: t('routePlaceholder'),
                spellCheck: false,
                onChange: (event) => {
                  const route = event.target.value
                  setDraft((current) => (current === null ? current : { ...current, route, keyRef: deriveKeyRef(route) }))
                },
              }),
              h('span', { className: 'pa_hint' }, t('routeHint')),
            ),
            h(
              'label',
              { className: 'pa_field' },
              h('span', { className: 'pa_label' }, t('displayNameLabel')),
              h('input', {
                className: 'pa_input',
                value: draft?.displayName ?? '',
                disabled,
                placeholder: t('displayNamePlaceholder'),
                onChange: (event) =>
                  setDraft((current) => (current === null ? current : { ...current, displayName: event.target.value })),
              }),
            ),
            h(
              'label',
              { className: 'pa_field' },
              h('span', { className: 'pa_label' }, t('keyRefLabel')),
              h('input', {
                className: 'pa_input',
                value: draft?.keyRef ?? '',
                disabled,
                spellCheck: false,
                onChange: (event) =>
                  setDraft((current) => (current === null ? current : { ...current, keyRef: event.target.value })),
              }),
              h('span', { className: 'pa_hint' }, t('keyRefHint')),
            ),
          ),
          formError.length > 0 ? h('p', { className: 'pa_fieldError', role: 'alert' }, formError) : null,
          h(
            'div',
            { className: 'pa_actions' },
            h('button', { type: 'submit', className: 'pa_button pa_primary', disabled }, creating ? t('creating') : t('create')),
          ),
        ),
      )
    }

    /** Slot entry: the page body inside the Settings content column. */
    function AliasesSection(props) {
      if (props.aliases === undefined || props.t === undefined) return null
      return h(AliasesBody, { t: props.t, store: props.aliases })
    }

    const inject = ['slots', 'locale', 'remote', 'remote.settings', 'remote.llm', 'remote.credentials']

    function apply(ctx) {
      const store = createAliasesStore(ctx)
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'provider-aliases: dictionaries')
      const t = ctx.locale.bind(NS)
      ctx.effect(() => {
        const disposers = [
          ctx.remote.$on('settings/document-updated', () => store.load()),
          ctx.remote.$on('llm/adapters-updated', () => store.load()),
          ctx.remote.$on('credentials/reference-updated', () => store.load()),
        ]
        const reset = ctx.on('connection/reset', () => store.load())
        return () => {
          for (const dispose of disposers) dispose()
          reset()
        }
      }, 'provider-aliases: pushed invalidations')
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'provider-aliases',
            order: 12,
            label: () => t('nav'),
            locale: NS,
            inject: () => ({ aliases: store }),
          },
          AliasesSection,
        ),
      )
    }

    return { inject, apply }
  },
})
