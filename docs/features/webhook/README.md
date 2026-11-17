# Webhook

- 源码：`src/modules/webhook/`、`src/modules/bot/` 和 `src/middleware/`
- 当前正式回调地址：`/api/bot/webhook`
- 当前链路：`WebhookMiddleware` 和 `WebhookService` 先处理回调协议，普通事件再交给 `BotController` 分发。
- 验证事件中的 `d.plain_token` 在 webhook 层直接返回响应，普通事件调用 `next()` 进入 Bot 业务处理。
- 不额外暴露 `/api/webhook/callback`，QQ 只配置 `/api/bot/webhook`。

后续详细文档应说明 QQ 回调事件格式、验证事件、Ed25519 签名校验、原始请求体处理和失败响应。
