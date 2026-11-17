import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  MusicProvider,
  SongInfo,
} from '../interfaces/music-provider.interface.js';

@Injectable()
export class QQMusicProvider implements MusicProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('QQ_MUSIC_API_KEY');
  }

  async search(keyword: string): Promise<SongInfo[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: {
            format: 'json',
            data: JSON.stringify({
              comm: { ct: 24, cv: 0 },
              req: {
                method: 'DoSearchForQQMusicDesktop',
                module: 'music.search.SearchCgiService',
                param: {
                  query: keyword,
                  num_per_page: 5,
                  page_num: 1,
                },
              },
            }),
          },
        }),
      );

      const songs = response.data?.req?.data?.body?.song?.list || [];
      return songs.map((song: any) => ({
        title: song.title,
        singer: song.singer.map((s: any) => s.name).join('/'),
        jumpUrl: `qqmusic://qq.com/media/song?songid=${song.id}`,
        imageUrl: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.mid}.jpg`,
        source: 'qq',
        mid: song.id,
      }));
    } catch (error) {
      console.error('QQ音乐搜索失败:', error);
      throw error;
    }
  }

  async getPlayUrl(songId: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: {
            format: 'json',
            data: JSON.stringify({
              req: {
                module: 'CDN.SrfCdnDispatchServer',
                method: 'GetCdnDispatch',
                param: { guid: '0', calltype: 0, userip: '' },
              },
              req_0: {
                module: 'vkey.GetVkeyServer',
                method: 'CgiGetVkey',
                param: {
                  guid: '0',
                  songmid: [songId],
                  songtype: [0],
                  uin: '0',
                  loginflag: 1,
                  platform: '20',
                },
              },
            }),
          },
        }),
      );

      const purl = response.data?.req_0?.data?.midurlinfo?.[0]?.purl;
      if (!purl) {
        throw new Error('获取播放链接失败');
      }

      return `http://ws.stream.qqmusic.qq.com/${purl}`;
    } catch (error) {
      console.error('获取QQ音乐播放链接失败:', error);
      throw error;
    }
  }
}
