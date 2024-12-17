import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { TtsService } from './tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Get('test')
  async test() {
    return 'Hello TTS !';
  }

  @Post('synthesize')
  async synthesize(@Body('text') text: string, @Res() response: Response) {
    try {
      const audioData = await this.ttsService.textToSpeech(text);

      // 设置响应头
      response.set({
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename=speech.wav',
      });

      // 发送音频数据
      response.send(audioData);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
}
