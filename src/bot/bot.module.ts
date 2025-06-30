import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotController } from './bot.controller';
import { BotService } from './services/bot.service';
import { TTSCommandHandler } from './handlers/tts-command.handler';
import { SongCommandHandler } from './handlers/song-command.handler';
import { JmCommandHandler } from './handlers/jm-command.handler';
import { AudioConverterService } from './services/ffmpeg.service';
import { TtsModule } from '../modules/tts/tts.module';
import { MusicModule } from '../modules/music/music.module';
import { JmcomicModule } from '../jmcomic/jmcomic.module';

@Module({
  imports: [ConfigModule, TtsModule, MusicModule, JmcomicModule],
  controllers: [BotController],
  providers: [
    BotService,
    TTSCommandHandler,
    SongCommandHandler,
    JmCommandHandler,
    AudioConverterService,
  ],
  exports: [BotService],
})
export class BotModule {}
