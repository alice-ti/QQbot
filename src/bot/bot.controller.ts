import { Controller, Post, Body } from '@nestjs/common';
import { BotService } from './bot.service';
import { ReplyTextMessage } from './bot.message.dto';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // 检查是否是群聊@消息事件
    if (body.t === 'GROUP_AT_MESSAGE_CREATE') {
      const {
        id, // 消息id
        group_openid, // 群聊的openid
        content, // 消息内容
      } = body.d;

      // 构建回复消息
      // const replyContent = `你好，我收到了你的消息：${content}`;

      // const replyMessage: ReplyTextMessage = {
      //   msg_type: 0,
      //   content: replyContent,
      //   msg_id: id,
      // };
      // 发送回复
      // await this.botService.sendMessage(group_openid, replyMessage);

      // TTS 语音合成
      await this.botService.sendTTSMessage(group_openid, {
        msg_id: id,
        content: content,
        msg_type: 7, // 语音消息类型
      });
    }
  }
}
