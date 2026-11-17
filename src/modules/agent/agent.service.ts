import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationMemoryService } from './memory/conversation-memory.service.js';
import { AgentToolRegistryService } from './agent-tool-registry.service.js';
import type {
  AgentMessage,
  AgentProvider,
  AgentToolContext,
} from './interfaces/index.js';

export interface AgentRequest {
  content: string;
  groupOpenid: string;
  messageId: string;
  scope?: 'group' | 'user';
  userOpenid?: string;
  sendTts?: (text: string) => Promise<void>;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly maxToolRounds = 4;
  private readonly appId: string;

  constructor(
    @Inject('AGENT_PROVIDER') private readonly provider: AgentProvider,
    private readonly memory: ConversationMemoryService,
    private readonly tools: AgentToolRegistryService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('QQ_APPID') ?? 'default';
  }

  async reply(request: AgentRequest): Promise<string> {
    const sessionKey = this.getSessionKey(request);
    const context: AgentToolContext = {
      sessionKey,
      groupOpenid: request.groupOpenid,
      messageId: request.messageId,
      userOpenid: request.userOpenid,
      sendTts: request.sendTts,
    };
    const userMessage: AgentMessage = {
      role: 'user',
      content: request.content.trim(),
    };
    const messages: AgentMessage[] = [
      {
        role: 'system',
        content:
          '你是一个 QQ 群机器人。请使用简洁、自然的中文回答。只有在确实需要时调用工具；工具返回的数据需要经过整理后再回复用户。不要编造工具没有返回的信息。',
      },
      ...this.memory.get(sessionKey),
      userMessage,
    ];

    try {
      for (let round = 0; round < this.maxToolRounds; round += 1) {
        const completion = await this.provider.complete(
          messages,
          this.tools.getDefinitions(),
        );
        const assistantMessage = completion.message;
        messages.push(assistantMessage);

        if (!assistantMessage.tool_calls?.length) {
          const content = assistantMessage.content?.trim();
          if (!content) {
            throw new Error('Agent returned an empty message');
          }
          this.memory.append(sessionKey, userMessage, {
            role: 'assistant',
            content,
          });
          return content;
        }

        for (const toolCall of assistantMessage.tool_calls) {
          let args: unknown = {};
          try {
            args = JSON.parse(toolCall.function.arguments || '{}');
          } catch {
            args = {};
          }
          const result = await this.tools.execute(
            toolCall.function.name,
            args,
            context,
          );
          messages.push({
            role: 'tool',
            content: result.content,
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
          });
        }
      }

      throw new Error('Agent exceeded the tool call limit');
    } catch (error) {
      this.logger.error(
        `Agent reply failed for ${sessionKey}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (
        error instanceof Error &&
        error.message === 'DEEPSEEK_API_KEY is not configured'
      ) {
        return '当前还没有配置 DeepSeek API，暂时无法进行智能对话。';
      }
      return '抱歉，我现在暂时无法处理这条消息，请稍后再试。';
    }
  }

  clearSession(
    groupOpenid: string,
    userOpenid?: string,
    scope: 'group' | 'user' = 'group',
  ): void {
    this.memory.clear(
      this.getSessionKey({
        groupOpenid,
        scope,
        userOpenid,
      }),
    );
  }

  private getSessionKey(
    request: Pick<AgentRequest, 'groupOpenid' | 'scope' | 'userOpenid'>,
  ): string {
    const scope = request.scope ?? 'group';
    const peerId =
      scope === 'user'
        ? (request.userOpenid ?? request.groupOpenid)
        : request.groupOpenid;
    return `qqbot:${this.appId}:${scope}:${peerId}`;
  }
}
