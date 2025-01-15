// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { TTSCommandHandler } from './handlers/tts-command.handler';
import { SongCommandHandler } from './handlers/song-command.handler';
import { AudioConverterService } from './ffmpeg.service';
import { TtsModule } from '../modules/tts/tts.module';
import { MusicModule } from '../modules/music/music.module';

@Module({
  imports: [ConfigModule, TtsModule, MusicModule],
  controllers: [BotController],
  providers: [
    BotService,
    TTSCommandHandler,
    SongCommandHandler,
    AudioConverterService,
  ],
  exports: [BotService],
})
export class BotModule {}
