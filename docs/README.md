# 项目文档

根目录的 [`AGENTS.md`](../AGENTS.md) 记录开发时必须遵守的核心约束。本目录用于维护架构、业务、接口和运维等详细内容。

## 文档结构

- [`operations.md`](./operations.md)：环境变量、部署、反向代理、进程管理和故障处理。
- [`architecture.md`](./architecture.md)：`src/` 目录职责、模块边界和后续迁移顺序。
- [`features/`](./features/)：按业务 feature 子目录维护业务代码说明。
- `api/`：Webhook、机器人接口和对外响应约定。
- `decisions/`：重要技术决策、取舍和迁移记录。

业务文档统一放在 `features/<feature>/` 下。当前 feature 与源码目录对应关系如下：

| Feature   | 源码目录               | 文档目录                                   |
| --------- | ---------------------- | ------------------------------------------ |
| QQ 机器人 | `src/modules/bot/`     | [`features/bot/`](./features/bot/)         |
| 音乐      | `src/modules/music/`   | [`features/music/`](./features/music/)     |
| TTS       | `src/modules/tts/`     | [`features/tts/`](./features/tts/)         |
| JMComic   | `src/modules/jmcomic/` | [`features/jmcomic/`](./features/jmcomic/) |
| Ollama    | `src/modules/ollama/`  | [`features/ollama/`](./features/ollama/)   |
| Webhook   | `src/modules/webhook/` | [`features/webhook/`](./features/webhook/) |
| Agent     | `src/modules/agent/`   | [`features/agent/`](./features/agent/)   |

每个 feature 目录可以继续按主题拆分，例如 `commands.md`、`flow.md`、`configuration.md` 和 `api.md`。不要把不同 feature 的业务规则混在同一个文档中。

## 文档规则

- 使用清晰、稳定的中文标题和小节；涉及代码、命令、环境变量时使用代码块。
- 记录当前行为和适用版本，过期内容要及时修订或标记。
- 业务规则、接口或部署方式变更时，在同一变更中更新对应文档。
- 只记录变量名、占位符和示例值，禁止提交真实密钥、令牌、签名 secret 或个人路径。
