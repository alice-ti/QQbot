import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type {
  AgentCompletion,
  AgentMessage,
} from '../interfaces/agent-message.interface.js';
import type {
  AgentProvider,
  AgentToolDefinition,
} from '../interfaces/index.js';

interface DeepSeekResponse {
  choices?: Array<{
    message?: AgentMessage;
    finish_reason?: string;
  }>;
}

@Injectable()
export class DeepSeekProvider implements AgentProvider {
  private readonly logger = new Logger(DeepSeekProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = (
      this.configService.get<string>('DEEPSEEK_BASE_URL') ??
      'https://api.deepseek.com'
    ).replace(/\/$/, '');
    this.model =
      this.configService.get<string>('DEEPSEEK_MODEL') ?? 'deepseek-chat';
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.timeoutMs = Number(
      this.configService.get<string>('DEEPSEEK_TIMEOUT_MS') ?? 30_000,
    );
  }

  async complete(
    messages: AgentMessage[],
    tools: AgentToolDefinition[],
  ): Promise<AgentCompletion> {
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<DeepSeekResponse>(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            temperature: 0.7,
            ...(tools.length > 0
              ? {
                  tools: tools.map((tool) => ({
                    type: 'function',
                    function: tool,
                  })),
                  tool_choice: 'auto',
                }
              : {}),
          },
          {
            timeout: this.timeoutMs,
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const choice = response.data?.choices?.[0];
      if (!choice?.message) {
        throw new Error('DeepSeek returned an empty response');
      }
      return {
        message: choice.message,
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      this.logger.error(
        'DeepSeek request failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
