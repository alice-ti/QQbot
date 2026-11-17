import { Injectable, OnModuleInit } from '@nestjs/common';
import { MusicService } from '../../music/music.service.js';
import { AgentToolRegistryService } from '../agent-tool-registry.service.js';
import type { AgentTool, AgentToolResult } from '../interfaces/index.js';

interface MusicSearchArgs {
  keyword?: string;
  source?: string;
}

@Injectable()
export class MusicSearchTool implements AgentTool, OnModuleInit {
  readonly definition = {
    name: 'music_search',
    description: '搜索 QQ 音乐或网易云音乐歌曲，返回歌曲标题、歌手和播放链接。',
    parameters: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string' as const,
          description: '歌曲名、歌手名或关键词',
        },
        source: {
          type: 'string' as const,
          enum: ['qq', 'netease'],
          description: '音乐来源，默认 qq',
        },
      },
      required: ['keyword'],
      additionalProperties: false,
    },
  };

  constructor(
    private readonly musicService: MusicService,
    private readonly registry: AgentToolRegistryService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(args: unknown): Promise<AgentToolResult> {
    const { keyword, source = 'qq' } = (args ?? {}) as MusicSearchArgs;
    if (!keyword?.trim()) {
      return { content: '缺少歌曲搜索关键词。' };
    }
    if (!['qq', 'netease'].includes(source)) {
      return { content: '音乐来源只能是 qq 或 netease。' };
    }

    const songs = await this.musicService.searchSong(keyword.trim(), source);
    if (!songs.length) {
      return { content: `没有找到与“${keyword.trim()}”相关的歌曲。` };
    }

    return {
      content: JSON.stringify(
        songs.slice(0, 5).map((song) => ({
          title: song.title,
          singer: song.singer,
          source: song.source,
          jumpUrl: song.jumpUrl,
          imageUrl: song.imageUrl,
        })),
      ),
    };
  }
}
