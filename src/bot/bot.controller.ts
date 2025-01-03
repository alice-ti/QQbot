import { Controller, Post, Body, Get } from '@nestjs/common';
import { BotService } from './bot.service';
import { ReplyTextMessage } from './bot.message.dto';
// import { SignatureGuard } from '../guards/signature/signature.guard';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get('test')
  async test() {
    return 'Bot !';
  }

  @Post('webhook')
  // @UseGuards(SignatureGuard)
  async handleWebhook(@Body() body: any) {
    const INSTRUCTION_LIST = {
      TTS: '/TTS',
    };

    // 检查是否是群聊@消息事件
    if (body.t === 'GROUP_AT_MESSAGE_CREATE') {
      const {
        id, // 消息id
        group_openid, // 群聊的openid
        content, // 消息内容
      } = body.d;

      if (content.startsWith(INSTRUCTION_LIST.TTS)) {
        // TTS 语音合成

        const _content = content.replace(INSTRUCTION_LIST.TTS, '').trim();

        await this.botService.sendTTSMessage(group_openid, {
          msg_id: id,
          content: _content,
          msg_type: 7, // 语音消息类型
        });
      }
      // 正常回复消息
      else {
        // 构建回复消息
        const replyContent = `你好，我收到了你的消息：${content}`;

        const replyMessage: ReplyTextMessage = {
          msg_type: 0,
          content: replyContent,
          msg_id: id,
        };
        // 发送回复;
        await this.botService.sendMessage(group_openid, replyMessage);
      }
    }
  }
}
