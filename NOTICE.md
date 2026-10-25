# NOTICE

The adapter half of this package (`lib/index.js`) is a modified copy of
`@deepseek-ai/dsh-llm-pi-ai` (MIT License, Copyright (c) 2026 DeepSeek),
extracted from the installed DeepSeek Harness build at `resources/app.asar`
and patched by `tools/sync.mjs`. `LICENSE` carries both notices: Dax233 for the
original portions of this repository, and DeepSeek for the modified upstream
adapter (the upstream MIT text is otherwise reproduced unchanged).

Adapter modifications:

- Adds an optional provider-profile field `catalog`: a route may reuse an
  installed pi-ai catalog provider's models, per-model wire protocols,
  endpoints, authentication, and reasoning metadata under a different route
  name and credential.
- Validates the alias in `resolveProfiles` (unknown or empty catalog) and lets
  the route keep `api`/`baseURL`/`models` as a fallback for model ids the
  installed catalog does not describe.
- Resolves route models, provider construction, and configurable-provider
  directory entries through the aliased catalog provider; catalog metadata wins
  over route overrides for models the catalog knows.
- Regenerates `package.json` from the installed build; runtime packages are
  declared as peers instead of dependencies so the profile never installs a
  second copy of the harness packages.

Everything else — `client.js`, `tools/`, `locale/`, `icon.svg`, `README.md`,
`tests/` — is original work by Dax233, released under the same MIT license.
