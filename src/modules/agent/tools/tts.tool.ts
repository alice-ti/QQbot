import { Injectable, OnModuleInit } from '@nestjs/common';
import type {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from '../interfaces/index.js';
import { AgentToolRegistryService } from '../agent-tool-registry.service.js';

interface TtsArgs {
  text?: string;
}

@Injectable()
export class TtsTool implements AgentTool, OnModuleInit {
  readonly definition = {
    name: 'text_to_speech',
    description: '把指定中文文本转换为语音并发送到当前 QQ 群。',
    parameters: {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string' as const,
          description: '要朗读的文本，建议不超过 500 个字符',
        },
      },
      required: ['text'],
      additionalProperties: false,
    },
  };

  constructor(private readonly registry: AgentToolRegistryService) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(
    args: unknown,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const text = (args as TtsArgs | undefined)?.text?.trim();
    if (!text) {
      return { content: '缺少要转换的文本。' };
    }
    if (text.length > 500) {
      return { content: '文本过长，请控制在 500 个字符以内。' };
    }
    if (!context.sendTts) {
      return { content: '当前消息上下文不支持发送语音。' };
    }

    await context.sendTts(text);
    return { content: '语音已经发送到当前 QQ 群。' };
  }
}
