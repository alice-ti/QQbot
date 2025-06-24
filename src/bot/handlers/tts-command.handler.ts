import { Injectable } from '@nestjs/common';
import { BotService } from '../services/bot.service';
import { CommandHandler } from '../interfaces/command-handler.interface';

@Injectable()
export class TTSCommandHandler implements CommandHandler {
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
    const cleanContent = content.replace('/TTS', '').trim();

    await this.botService.sendTTSMessage(groupOpenid, {
      msg_id: messageId,
      content: cleanContent,
      msg_type: 7,
    });
  }
}
