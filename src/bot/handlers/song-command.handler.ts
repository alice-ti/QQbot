import { Injectable } from '@nestjs/common';
import { BotService } from '../services/bot.service';
import { CommandHandler } from '../interfaces/command-handler.interface';
import { ReplyTextMessage } from '../dto/bot.message.dto';

@Injectable()
export class SongCommandHandler implements CommandHandler {
  constructor(private readonly botService: BotService) {}

  async handle({
    content,
    groupOpenid,
    messageId,
  }: {
    content: string;
    groupOpenid: string;
    messageId: string;
  }): Promise<void> {
    // 解析命令格式：/SONG [源] 歌曲名
    // 例如：/SONG qq 起风了
    // 或者：/SONG netease 起风了
    const parts = content.replace('/SONG', '').trim().split(' ');
    let source = 'qq'; // 默认使用QQ音乐
    let songName = '';

    if (parts.length >= 2) {
      const possibleSource = parts[0].toLowerCase();
      if (['qq', 'netease'].includes(possibleSource)) {
        source = possibleSource;
        songName = parts.slice(1).join(' ');
      } else {
        songName = parts.join(' ');
      }
    } else {
      songName = parts.join(' ');
    }

    if (!songName) {
      const replyMessage: ReplyTextMessage = {
        msg_type: 0,
        content:
          '请输入歌曲名称，例如：\n/SONG 起风了\n/SONG qq 起风了\n/SONG netease 起风了',
        msg_id: messageId,
      };
      await this.botService.sendMessage(groupOpenid, replyMessage);
      return;
    }

    try {
      // 发送音乐卡片消息
      await this.botService.sendSongMessage(groupOpenid, {
        msg_type: 4,
        content: source + '#' + songName,
        msg_id: messageId,
      });
    } catch (error) {
      console.error('发送音乐卡片消息失败', error);

      // 如果发送失败，发送错误提示
      const errorMessage: ReplyTextMessage = {
        msg_type: 0,
        content: '抱歉，歌曲分享失败，请稍后重试',
        msg_id: messageId,
      };
      await this.botService.sendMessage(groupOpenid, errorMessage);
    }
  }
}
