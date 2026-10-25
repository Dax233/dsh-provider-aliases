# dsh-provider-aliases

DeepSeek Harness（DSH）的 **模型目录别名** 插件：让一个已安装的 pi-ai catalog
provider 同时挂多条凭据路由（例如两个 OpenCode Go 套餐、同一厂商的多个账号），
并在 **设置 → 模型别名** 提供一个可视化面板管理它们。

一个包同时包含两半：

- **Host 半边**：内置 `@deepseek-ai/dsh-llm-pi-ai` 适配器的同名扩展副本，新增
  `catalog` 别名能力（route 可复用另一个 catalog 的模型、每模型线协议、端点、
  headers 与推理档位）；
- **Client 半边**：与「模型」同级的设置分区，创建/重命名/移除任意数量的别名，
  保存/清除每条路由的 API Key。

## 一次安装

需要 DSH Desktop 0.2.x（Windows 10/11）。本仓库的 `lib/index.js` 由
**DSH 0.2.1-rc.3** 生成。

```sh
dsh plugin --profile desktop add github:Dax233/dsh-provider-aliases
```

然后**重启 DSH Desktop**：安装的是同名覆盖包，Loader 原有的 `llm-pi-ai` 行
会解析到它，Host 半边接管适配器，Client 半边提供设置面板。

> 为什么是可安装依赖而不是普通 bundle：DSH 在 Loader 启动时按名字
> `@deepseek-ai/dsh-llm-pi-ai` 解析 `llm-pi-ai` 行，普通插件无法在运行时替换
> 它；Client 模块则按已启用行解析到的包名扫描 `dsh.client`，所以 UI 可以跟着
> 同一个包一起发布。

## 配置

```yaml
- id: llm-pi-ai
  name: '@deepseek-ai/dsh-llm-pi-ai'
  config:
    providers:
      opencode-go:
        apiKeyEnv: OPENCODE_GO_API_KEY
      opencode-go-2:
        catalog: opencode-go        # 复用该 catalog 的模型、协议、headers、认证
        displayName: OpenCode Go 2
        apiKeyEnv: OPENCODE_GO_API_KEY_2
```

- `catalog` 必须是已安装的 pi-ai catalog provider id；
- 可以和 `api` / `baseURL` / `models` 同时出现：
  - catalog 已有的模型优先使用 catalog 的协议、端点、推理档位与 thinking 格式；
  - catalog 未收录的模型（上游新增、pi-ai 目录未收录）走 route 的 `api` + `baseURL`；
  - `modelOverrides`、`compat`、`retryPolicy`、`headers` 等仍可按 route 覆盖；
- 思维深度：alias route 的模型继承 catalog 的 `reasoning` 与 `thinkingLevelMap`，
  composer 档位菜单与 catalog route 一致；不支持的档位会被拒绝
  （`UNSUPPORTED_REASONING_EFFORT`）。

## 面板

- **已配置的别名**：Key 状态圆点、可点击重命名的名称、catalog chip、模型数、
  route id、凭据引用；行内保存/清除 Key；移除别名两步确认。
- **添加别名**：选择目录 provider（友好名 + id）、Route ID 自动建议、显示名称、
  凭据引用自动派生；创建后自动进位到下一个编号。
- **其他 route**：折叠为只读列表（目录 route / 自定义 route）。
- 只用宿主主题 token、跟随浅色/深色；中英双语文案；包内原创 SVG 图标。

所有读写走 DSH 现有 seam：`remote.settings.describe/mutate`（`llm-pi-ai`
命名空间，带 revision）+ `remote.credentials.describe/set/unset`（永不回显 Key）。

## DSH 升级后

覆盖的适配器编译自特定 DSH 版本。升级 DSH 后：

1. 等待本仓库发布对应新版的更新；或
2. clone 后运行 `node tools/sync.mjs` 从当前安装的 `app.asar` 重新生成
   `lib/index.js` 与 `package.json` 的版本/peer，再重启；
3. 跨到 0.3.x 时旧覆盖包会被组合层拒绝加载，重跑 sync 即可。

`node` 用 DSH 自带的即可（Windows）：
`<DSH 安装目录>\resources\runtime\primary-runtime\dependencies\node\bin\node.exe`。

## 仓库内容

| 文件 | 用途 |
| --- | --- |
| `lib/index.js` | 由安装的 DSH 构建生成并打上 alias 补丁的适配器 |
| `client.js` | 设置页的浏览器半边 |
| `package.json` | 同名包 manifest；runtime 依赖是 peers（由 DSH 运行时解析） |
| `tools/sync.mjs` | 从 `resources/app.asar` 提取、打补丁、重新生成包 |
| `tools/install.mjs` | 把本目录以同名 `link:` 依赖装进 profile |
| `tools/add-route.mjs` | 在 profile 的 `cordis.patch.yml` 追加一条 alias route |
| `profile-patch.example.yml` | 配置片段示例 |
| `tests/manifest.test.mjs` | 离线校验补丁标记、Client 注册与包契约 |

## 本地开发 / 维护

```sh
node tools/sync.mjs                 # 重新生成（DSH 升级后）
node tools/install.mjs --profile desktop
node tools/add-route.mjs --profile desktop --route opencode-go-2 --catalog opencode-go
npm test                            # 离线校验
```

`install.mjs` 会备份 profile 的 `package.json` / `pnpm-lock.yaml`。

## 卸载

从 profile `package.json` 的 dependencies 删掉
`"@deepseek-ai/dsh-llm-pi-ai"`，重跑 `pnpm install`，删掉 alias route，重启 DSH。

## 验证记录

在隔离 DSH_HOME 中用真实 OpenCode Go Key 验证：

- `opencode-go` / `opencode-go-2(catalog: opencode-go)` 两条 route 同一进程共存，
  无 `DUPLICATE_ADAPTER`，第二凭据经独立 `apiKeyEnv` 解析；
- `deepseek-v4.1-flash` + `reasoningEffort: max` 成功；`minimal` 被拒绝；
- 同一条 alias route 上 `claude-haiku-5-5`（anthropic-messages，catalog 端点
  `/zen/go`）也工作，证明每模型协议/端点优先级正确；
- catalog 未收录的 `qwen3.7-max` 经 route 的 `api`/`baseURL` 兜底成功。
- 面板在实机 desktop profile 上验证创建/重命名/Key 保存/清除/移除，浅色与深色
  主题均正常；测试数据已清理。

## 许可

本仓库 Host 半边是 `@deepseek-ai/dsh-llm-pi-ai`（MIT，Copyright (c) 2026
DeepSeek）的修改副本，保留上游 `LICENSE`，修改说明见 `NOTICE.md`；Client 半边
与工具为同一 MIT 许可下的原创代码。
