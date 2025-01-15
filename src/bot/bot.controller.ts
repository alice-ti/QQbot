import { Controller, Post, Body, Get } from '@nestjs/common';
import { BotService } from './bot.service';
import { ReplyTextMessage } from './bot.message.dto';
import { BotCommand } from './constants/commands';
import { TTSCommandHandler } from './handlers/tts-command.handler';
import { SongCommandHandler } from './handlers/song-command.handler';
import { CommandHandler } from './interfaces/command-handler.interface';

@Controller('bot')
export class BotController {
  private commandHandlers: Map<string, CommandHandler>;

  constructor(
    private readonly botService: BotService,
    private readonly ttsHandler: TTSCommandHandler,
    private readonly songHandler: SongCommandHandler,
  ) {
    this.commandHandlers = new Map<BotCommand, CommandHandler>([
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

      // 默认消息回复
      const replyMessage: ReplyTextMessage = {
        msg_type: 0,
        content: `你好，我收到了你的消息：${content}`,
        msg_id: id,
      };
      await this.botService.sendMessage(group_openid, replyMessage);
    }
  }
}
