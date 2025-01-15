import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  MusicProvider,
  SongInfo,
} from '../interfaces/music-provider.interface';

@Injectable()
export class NeteaseMusicProvider implements MusicProvider {
  private readonly baseUrl = 'https://music.163.com/api';

  constructor(private readonly configService: ConfigService) {}

  async search(keyword: string): Promise<SongInfo[]> {
    try {
      // 调用网易云音乐Web搜索API
      const response = await axios.get(`${this.baseUrl}/search/get/web`, {
        params: {
          s: keyword, // 搜索关键词
          type: 1, // 1: 单曲
          limit: 5, // 返回数量
          offset: 0, // 偏移量
          total: true, // 是否返回总数
          csrf_token: '', // 无需登录可以为空
        },
      });

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
