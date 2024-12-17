// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { TtsService } from 'src/modules/tts/tts.service';
import { ConfigModule } from '@nestjs/config';
import { AudioConverterService } from './ffmpeg.service';

@Module({
  imports: [ConfigModule],
  providers: [BotService, TtsService, AudioConverterService],
  exports: [BotService],
  controllers: [BotController],
})
export class BotModule {}
