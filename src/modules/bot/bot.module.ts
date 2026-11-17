import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BotController } from './bot.controller.js';
import { BotService } from './services/bot.service.js';
import { TTSCommandHandler } from './handlers/tts-command.handler.js';
import { SongCommandHandler } from './handlers/song-command.handler.js';
import { JmCommandHandler } from './handlers/jm-command.handler.js';
import { AudioConverterService } from './services/ffmpeg.service.js';
import { TtsModule } from '../tts/tts.module.js';
import { MusicModule } from '../music/music.module.js';
import { JmcomicModule } from '../jmcomic/jmcomic.module.js';
import { AgentModule } from '../agent/agent.module.js';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TtsModule,
    MusicModule,
    JmcomicModule,
    AgentModule,
  ],
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
