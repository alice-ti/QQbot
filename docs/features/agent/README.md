# Agent 对话

- 源码：`src/modules/agent/`
- 入口：未匹配 `/TTS`、`/SONG`、`/JM` 的群消息会进入 `AgentService`。
- 模型：通过 DeepSeek 的 OpenAI 兼容 `chat/completions` 接口调用。
- 会话：默认按 `qqbot:<appId>:group:<groupOpenid>` 保存在内存中，空闲 30 分钟后清理，最多保留 20 条消息和 1000 个会话。

## 配置

在运行环境中设置以下变量：

```dotenv
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TIMEOUT_MS=30000
```

`DEEPSEEK_API_KEY` 未配置时，机器人会返回暂时不可用提示，不会阻止 Nest 应用启动。

## 工具

Agent 工具采用注册表模式。每个工具提供名称、说明、JSON Schema 参数和异步执行函数，模型可以在一轮对话中调用工具，最多连续调用 4 轮。

当前工具：

- `music_search`：复用 `MusicService` 搜索 QQ 音乐或网易云音乐。
- `text_to_speech`：复用现有 TTS 和 QQ 文件发送链路，把文本转为语音发送到当前群。
- `download_comic`：复用 `JmcomicDownloadService` 下载指定数字 ID 的漫画。

工具执行失败会作为工具结果交给模型处理。暂不开放任意 shell、文件系统、URL 抓取或代码执行能力；如果后续增加这类工具，必须补充白名单、超时、大小限制和权限确认。

## 消息处理

QQ webhook 会快速返回 `200`，模型请求和工具执行在后台完成，最后通过 QQ 主动消息接口发送回复。因此 DeepSeek 的请求时间不会直接占用 webhook 响应窗口。固定命令仍然优先执行。
