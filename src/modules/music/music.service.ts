import { Injectable } from '@nestjs/common';
import { QQMusicProvider } from './providers/qq-music.provider.js';
import { NeteaseMusicProvider } from './providers/netease-music.provider.js';
import { SongInfo } from './interfaces/music-provider.interface.js';

@Injectable()
export class MusicService {
  constructor(
    private readonly qqMusicProvider: QQMusicProvider,
    private readonly neteaseMusicProvider: NeteaseMusicProvider,
  ) {}

  async searchSong(
    keyword: string,
    source: string = 'qq',
  ): Promise<SongInfo[]> {
    switch (source.toLowerCase()) {
      case 'qq':
        return this.qqMusicProvider.search(keyword);
      case 'netease':
        return this.neteaseMusicProvider.search(keyword);
      default:
        throw new Error(`不支持的音乐源: ${source}`);
    }
  }
}
