import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { QQMusicProvider } from './providers/qq-music.provider';
import { NeteaseMusicProvider } from './providers/netease-music.provider';

@Module({
  providers: [MusicService, QQMusicProvider, NeteaseMusicProvider],
  exports: [MusicService],
})
export class MusicModule {}
