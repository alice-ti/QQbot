import { Controller, Post, Body, Get } from '@nestjs/common';
import { BotService } from './services/bot.service';
import { ReplyTextMessage } from './dto/bot.message.dto';
import { BotCommand } from './constants/commands';
import { TTSCommandHandler } from './handlers/tts-command.handler';
import { SongCommandHandler } from './handlers/song-command.handler';
import { JmCommandHandler } from './handlers/jm-command.handler';
import { CommandHandler } from './interfaces/command-handler.interface';

@Controller('bot')
export class BotController {
  private commandHandlers: Map<string, CommandHandler>;

  constructor(
    private readonly botService: BotService,
    private readonly jmHandler: JmCommandHandler,
    private readonly ttsHandler: TTSCommandHandler,
    private readonly songHandler: SongCommandHandler,
  ) {
    this.commandHandlers = new Map<BotCommand, CommandHandler>([
      [BotCommand.JM, jmHandler],
      [BotCommand.TTS, ttsHandler],
      [BotCommand.SONG, songHandler],
    ]);
  }

  @Get('test')
  async test() {
    return 'Bot !';
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    if (body.t === 'GROUP_AT_MESSAGE_CREATE') {
      // 添加消息去重
      if (this.isDuplicateMessage(body.d)) {
        console.log('重复消息，跳过处理:', body.d.id);
        return { code: 0 };
      }

      const { id, group_openid, content } = body.d;

      // 获取指令
      const command = Object.values(BotCommand).find((cmd) =>
        content.trim().startsWith(cmd),
      );

      console.log('webhook-command', command);
      if (command) {
        const handler = this.commandHandlers.get(command);
        if (handler) {
          await handler.handle({
            content,
            groupOpenid: group_openid,
            messageId: id,
          });
          return;
        }
      }

      // if (content.includes('有的兄弟')) {
      //   await this.botService.sendTestTTSMessage(group_openid, {
      //     msg_id: id,
      //     content: 'bro',
      //     msg_type: 7,
      //   });
      //   return;
      // }

      // 默认消息回复
      const replyMessage: ReplyTextMessage = {
        msg_type: 0,
        content: `你好，我收到了你的消息：${content}`,
        msg_id: id,
      };
      await this.botService.sendMessage(group_openid, replyMessage);
    }
  }

  private processedMessages = new Set<string>();

  private isDuplicateMessage(message: any): boolean {
    const messageId = message.id;

    if (this.processedMessages.has(messageId)) {
      return true;
    }

    this.processedMessages.add(messageId);

    // 清理过期消息ID，避免内存泄漏
    if (this.processedMessages.size > 1000) {
      const firstId = this.processedMessages.values().next().value;
      this.processedMessages.delete(firstId);
    }

    return false;
  }
}
