import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  MusicProvider,
  SongInfo,
} from '../interfaces/music-provider.interface.js';

@Injectable()
export class NeteaseMusicProvider implements MusicProvider {
  private readonly baseUrl = 'https://music.163.com/api';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async search(keyword: string): Promise<SongInfo[]> {
    try {
      // 调用网易云音乐Web搜索API
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/search/get/web`, {
          params: {
            s: keyword,
            type: 1,
            limit: 5,
            offset: 0,
            total: true,
            csrf_token: '',
          },
        }),
      );

      const songs = response.data?.result?.songs || [];
      return songs.map((song: any) => ({
        title: song.name,
        singer: song.artists.map((artist: any) => artist.name).join('/'),
        jumpUrl: `https://music.163.com/song?id=${song.id}`,
        imageUrl: song.album?.picUrl
          ? `${song.album.picUrl}?param=300y300`
          : '',
        source: 'netease',
        mid: song.id.toString(),
      }));
    } catch (error) {
      console.error('网易云音乐搜索失败:', error);
      throw error;
    }
  }
}
