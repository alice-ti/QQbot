# Source 架构说明

本文档记录当前 `src/` 的职责边界、已发现的问题和后续调整顺序。业务 feature 已统一放在 `src/modules/` 下，目录迁移保持现有接口和业务行为不变。

## 当前职责

| 目录                   | 当前职责                                     | 评价                                     |
| ---------------------- | -------------------------------------------- | ---------------------------------------- |
| `src/app.*`            | 根模块、启动配置、静态资源和全局中间件       | 合理，属于应用装配层                     |
| `src/modules/bot/`     | QQ 消息入口、命令分发、QQ API 调用和命令处理 | 是核心 feature，但 `BotService` 职责过重 |
| `src/modules/music/`   | 音乐搜索和平台 provider                      | feature 边界清晰                         |
| `src/modules/tts/`     | Azure TTS 接入和 TTS HTTP 接口               | feature 边界清晰                         |
| `src/modules/jmcomic/` | 漫画下载、文件读取和漫画 HTTP 接口           | feature 职责清晰                         |
| `src/modules/ollama/`  | Ollama HTTP 接口和客户端调用                 | feature 职责清晰                         |
| `src/modules/webhook/` | QQ 回调协议适配、验证响应和回调中间件        | 作为 `/api/bot/webhook` 的前置层         |
| `src/middleware/`      | 其他跨领域请求中间件                         | 后续可继续收敛到公共基础设施             |

## Webhook 与 Bot 是同一条请求链路

QQ 实际请求的正式地址是 `POST /api/bot/webhook`。请求先经过 `WebhookMiddleware` 和 `WebhookService`，验证事件直接返回 `plain_token` 响应，普通事件调用 `next()`，再由 `BotController` 处理消息和命令。这是同一个 HTTP 请求的前置校验和业务处理，不是两个外部 URL 之间的跳转。

因此，`WebhookModule` 只提供回调协议层，不额外暴露 `/api/webhook/callback`。`BotModule` 保留 `/api/bot/webhook` 路由和业务事件处理职责。

## 需要优先处理的问题

### 普通事件的签名校验

当前 `WebhookMiddleware` 已处理 QQ 验证事件的 `d.plain_token`，但普通事件的 `X-Signature-Ed25519` 校验还没有接入正式链路。`src/middleware/auth/qqsignature.middleware.ts` 有一套未使用的校验实现，但它使用解析后的 JSON，不适合直接验证依赖原始请求体的签名。

后续应先根据当前 QQ 官方文档确认签名格式，再使用 `req.rawBody` 实现校验，并补充验证成功、签名错误、缺失 header 和请求体变化等测试。确认协议前不要直接挂载旧的 `QQSignatureMiddleware`。

### 签名组件职责

`src/modules/webhook/webhook.middleware.ts` 和 `src/middleware/auth/qqsignature.middleware.ts` 都涉及 QQ 签名。后续应合并为一个明确的 QQ 签名组件，并区分：

- 回调验证事件的响应签名；
- 普通消息请求的 Ed25519 校验。

### BotService 需要拆分

`src/modules/bot/services/bot.service.ts` 同时负责 access token、QQ HTTP 调用、文本消息、音乐卡片、语音文件上传和 TTS 业务编排。它已经成为多个 feature 的公共上帝 service，继续增加命令会使依赖和测试变得困难。

建议后续拆成：

- `QqApiService`：token、请求头、QQ API 基础调用；
- `QqMessageService`：文本、卡片、文件和语音消息；
- 各命令 handler：只编排命令输入、领域 service 和消息发送。

### 命令 handler 与 JMComic 领域边界重叠

`JmCommandHandler` 目前同时处理命令解析、下载结果查找、文件改名和 URL 拼接。文件路径和公开 URL 应由 JMComic feature 自己负责，handler 只保留命令解析和回复消息。

## 跨 feature 能力的放置规则

业务 feature 统一放在 `src/modules/<feature>/`。跨 feature 复用的组件再放入公共或基础设施目录：

```text
src/
  app.module.ts
  main.ts
  modules/
    bot/
    music/
    tts/
    jmcomic/
    ollama/
    webhook/
  common/
    middleware/
    audio/
  infrastructure/
    qq/
```

当前 `src/middleware/` 仍保留在根目录，后续只有在明确需要统一公共基础设施时再迁移到 `src/common/middleware/`。`AudioConverterService` 目前只由 bot 使用，暂不提前抽到公共目录。

## 建议迁移顺序

1. 根据 QQ 当前文档确认普通事件的 `X-Signature-Ed25519` 校验要求，并补充原始请求体签名校验测试。
2. 合并签名校验逻辑，并把 secret 全部保持为配置注入。
3. 拆分 `BotService` 的 QQ API 适配和消息用例。
4. 将 `JmCommandHandler` 中的文件查找、改名和 URL 拼接收回 JMComic feature。
5. 将音频转换等能力迁移到 `common/` 或 `infrastructure/`，仅在确实被多个 feature 复用时进行。

## 当前暂不调整的内容

- 保持现有 `/api/bot/webhook`、`/api/comic`、`/api/tts` 和 `/api/ollama` 路径。
- 不新增第二个外部 Webhook 地址，保持 QQ 配置使用 `/api/bot/webhook`。
- 不在目录迁移阶段同时改动 QQ 消息格式、第三方 provider 协议或下载脚本。
