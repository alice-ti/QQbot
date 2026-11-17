import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AgentService } from '../agent/agent.service.js';
import { BotCommand } from './constants/commands.js';
import { JmCommandHandler } from './handlers/jm-command.handler.js';
import { SongCommandHandler } from './handlers/song-command.handler.js';
import { TTSCommandHandler } from './handlers/tts-command.handler.js';
import type { CommandHandler } from './interfaces/command-handler.interface.js';
import { BotService } from './services/bot.service.js';

interface GroupMessageEvent {
  t?: string;
  d: {
    id: string;
    group_openid: string;
    content: string;
    author?: {
      member_openid?: string;
      user_openid?: string;
    };
  };
}

@Controller('bot')
export class BotController {
  private readonly logger = new Logger(BotController.name);
  private readonly commandHandlers: Map<string, CommandHandler>;
  private readonly processedMessages = new Set<string>();

  constructor(
    private readonly botService: BotService,
    private readonly jmHandler: JmCommandHandler,
    private readonly ttsHandler: TTSCommandHandler,
    private readonly songHandler: SongCommandHandler,
    private readonly agentService: AgentService,
  ) {
    this.commandHandlers = new Map<BotCommand, CommandHandler>([
      [BotCommand.JM, jmHandler],
      [BotCommand.TTS, ttsHandler],
      [BotCommand.SONG, songHandler],
    ]);
  }

  @Get('test')
  async test(): Promise<string> {
    return 'Bot !';
  }

  @Post('webhook')
  async handleWebhook(
    @Body() body: GroupMessageEvent,
  ): Promise<{ code: 0 } | void> {
    if (body.t !== 'GROUP_AT_MESSAGE_CREATE') {
      return { code: 0 };
    }

    if (this.isDuplicateMessage(body.d)) {
      this.logger.debug(`Duplicate QQ message skipped: ${body.d.id}`);
      return { code: 0 };
    }

    const { id, group_openid: groupOpenid, content } = body.d;
    const command = Object.values(BotCommand).find((item) =>
      content.trim().startsWith(item),
    );

    if (command) {
      const handler = this.commandHandlers.get(command);
      if (handler) {
        await handler.handle({
          content,
          groupOpenid,
          messageId: id,
        });
        return;
      }
    }

    // DeepSeek 及工具调用可能超过 QQ webhook 的响应时间，后台处理后主动发消息。
    void this.handleAgentMessage({
      content,
      groupOpenid,
      messageId: id,
      userOpenid: body.d.author?.member_openid ?? body.d.author?.user_openid,
    });
    return { code: 0 };
  }

  private async handleAgentMessage({
    content,
    groupOpenid,
    messageId,
    userOpenid,
  }: {
    content: string;
    groupOpenid: string;
    messageId: string;
    userOpenid?: string;
  }): Promise<void> {
    try {
      const reply = await this.agentService.reply({
        content,
        groupOpenid,
        messageId,
        userOpenid,
        sendTts: (text) =>
          this.botService.sendTTSMessage(groupOpenid, {
            msg_type: 7,
            content: text,
            msg_id: messageId,
          }),
      });
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: reply,
        msg_id: messageId,
      });
    } catch (error) {
      this.logger.error(
        'Agent message handling failed',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private isDuplicateMessage(message: { id: string }): boolean {
    if (this.processedMessages.has(message.id)) {
      return true;
    }

    this.processedMessages.add(message.id);
    if (this.processedMessages.size > 1000) {
      const firstId = this.processedMessages.values().next().value;
      if (firstId) {
        this.processedMessages.delete(firstId);
      }
    }
    return false;
  }
}
