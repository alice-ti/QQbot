# AGENTS.md

## 目的与适用范围

本文档是本项目的开发约束和代码规范入口，适用于所有源代码、测试和配置变更。详细的架构说明、业务流程和运维步骤统一放在 [`docs/`](./docs/) 下。

## 项目基线

- 项目是基于 NestJS 12 的 QQ 机器人服务。
- 使用 Node.js `>=20.19.0`、pnpm、TypeScript 和 ESM。
- TypeScript 使用 `NodeNext` 模块解析；源码中的本地相对导入必须带 `.js` 后缀。
- 生产构建产物位于 `dist/`，不要直接编辑生成文件。
- 当前应用使用全局前缀 `/api`，静态上传资源使用 `/uploads`。已有接口路径和响应行为属于兼容边界，修改前需要同步更新文档和测试。

## 目录职责

- `src/app.module.ts`：根模块、全局配置、静态资源和全局中间件。
- `src/modules/bot/`：QQ 消息接收、命令分发和机器人编排。
- `src/modules/`：按能力拆分的业务模块，例如 TTS 和音乐。
- `src/modules/ollama/`、`src/modules/jmcomic/`：独立的外部能力模块。
- `src/modules/webhook/`、`src/middleware/`：Webhook 接口和请求签名校验。
- `test/`：端到端测试；单元测试与被测源文件放在同一目录。
- `docs/`：架构、接口和运维等详细文档；业务代码说明统一放在 `docs/features/<feature>/`。

新增能力时优先创建独立的 Nest 模块，并保持模块职责单一。控制器只负责协议适配和参数转换，业务流程放在 service 或专门的 handler 中，外部平台调用集中在 provider 或 integration service 中。

## NestJS 代码规范

- 使用 NestJS 依赖注入；不要在业务代码中直接 `new` service、provider 或客户端。
- 每个 feature module 明确声明 `imports`、`controllers`、`providers` 和必要的 `exports`，避免依赖根模块的隐式状态。
- 文件遵循 Nest 常用命名：`*.module.ts`、`*.controller.ts`、`*.service.ts`、`*.provider.ts`、`*.dto.ts`、`*.spec.ts`。
- 控制器方法使用明确的 HTTP 装饰器和返回类型；新增请求参数优先使用 DTO 和 `class-validator` 校验。
- 配置通过 `ConfigService` 读取，禁止在源码中写入 token、密钥、签名 secret 或生产地址。敏感配置放在环境变量，并在文档中只记录变量名和示例格式。
- 这是对新增和修改代码的要求；历史代码中的硬编码配置或直接控制台日志应在涉及对应模块时逐步迁移，不要继续复制。
- 外部调用必须处理超时、异常和可观测日志；日志使用 Nest `Logger`，不要新增 `console.log` 调试输出。
- 需要保留原始请求体进行签名校验时，必须在请求解析前保存 raw body，并在校验失败时返回明确的 4xx 响应。
- 不要在 controller、middleware 或 provider 中复制相同的鉴权、请求构造和错误转换逻辑；提取为可复用 service 或 guard。

## 外部 HTTP 与异步处理

- HTTP 请求统一优先使用 `@nestjs/axios` 提供的 `HttpService`，通过 `firstValueFrom` 转换 Observable。
- 不要阻塞事件循环；文件、网络和子进程操作使用异步 API，或明确说明同步调用的边界。
- 处理 QQ、音乐平台、Azure、Ollama 等外部服务时，隔离平台响应类型，不要把第三方响应对象直接暴露为公共接口契约。
- 启动阶段的外部请求必须捕获失败，不能因为远端暂时不可用导致 Nest 进程崩溃。

## ESM 与 TypeScript

- 保持 `package.json` 的 `"type": "module"` 和 `tsconfig.json` 的 `NodeNext` 配置一致。
- 本地导入使用编译后的 `.js` 路径，例如 `import { AppModule } from './app.module.js'`。
- 类型只在类型位置使用 `import type`，避免不必要的运行时导入。
- 使用 `fileURLToPath(import.meta.url)` 获取文件系统路径；不要重新引入 CommonJS 的 `__dirname` 假设。
- 尽量为公共 service 方法、DTO 和外部响应定义类型；确需使用 `any` 时说明原因并限制范围。

## 格式、静态检查与测试

- 遵循 `.prettierrc`：单引号、尾随逗号、自动换行符。
- ESLint 检查 `src/**/*.ts` 和 `test/**/*.ts`；提交前至少运行：

  ```bash
  pnpm lint
  pnpm build
  pnpm test --runInBand
  pnpm test:e2e --runInBand
  ```

- 单元测试不得访问真实 QQ、音乐平台、Azure 或其他外部网络；使用 provider/service mock 验证业务行为。
- e2e 测试结束后关闭 Nest application，避免测试进程和端口泄漏。
- 新增或修改业务分支时补充有意义的测试；不要只为覆盖率复制实现细节。

## 依赖、文件和提交边界

- 使用 pnpm 管理依赖。修改 `package.json` 后同步更新 `pnpm-lock.yaml`，不要手工拼接锁文件内容。
- webpack、ts-loader 等仅用于开发构建；不要将开发工具引入运行时业务代码。
- 不提交 `.env`、访问令牌、生成的上传文件、`dist/`、coverage 和临时调试文件。
- 变更应保持小而集中；涉及接口、环境变量、部署方式或业务行为时，同时更新 `docs/` 中对应文档。业务变更更新对应的 `docs/features/<feature>/`。

## 详细文档

从 [`docs/README.md`](./docs/README.md) 查找或新增详细文档。业务文档按 feature 子目录归档，文档应说明适用范围、当前状态、配置项和变更影响；不要在文档中写入真实密钥或个人机器的绝对路径。
