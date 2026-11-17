import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MusicService } from './music.service.js';
import { QQMusicProvider } from './providers/qq-music.provider.js';
import { NeteaseMusicProvider } from './providers/netease-music.provider.js';

@Module({
  imports: [HttpModule],
  providers: [MusicService, QQMusicProvider, NeteaseMusicProvider],
  exports: [MusicService],
})
export class MusicModule {}
