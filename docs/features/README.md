# Feature 文档

本目录按业务 feature 管理文档，每个子目录对应一个主要源码模块。文档说明业务行为、处理流程、外部依赖、配置和接口约定；通用开发规范仍以根目录 [`AGENTS.md`](../../AGENTS.md) 为准。

## 目录

- [`bot/`](./bot/)：QQ 消息接收、命令分发和机器人编排。
- [`music/`](./music/)：QQ 音乐、网易云音乐搜索和音乐卡片消息。
- [`tts/`](./tts/)：文本转语音和音频处理。
- [`jmcomic/`](./jmcomic/)：漫画搜索、图片和 PDF 下载。
- [`ollama/`](./ollama/)：Ollama 对话接口。
- [`webhook/`](./webhook/)：Webhook 回调和签名校验。
- [`agent/`](./agent/)：DeepSeek 对话、会话记忆和受控 Agent 工具。

新增业务模块时，同时创建对应的 feature 子目录和入口 README；业务细节再按主题拆分为独立 Markdown 文件。
