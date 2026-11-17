import { Injectable, OnModuleInit } from '@nestjs/common';
import { JmcomicDownloadService } from '../../jmcomic/jmcomic-download.service.js';
import type { AgentTool, AgentToolResult } from '../interfaces/index.js';
import { AgentToolRegistryService } from '../agent-tool-registry.service.js';

interface JmcomicArgs {
  comicId?: string;
}

@Injectable()
export class JmcomicDownloadTool implements AgentTool, OnModuleInit {
  readonly definition = {
    name: 'download_comic',
    description: '下载指定 JMComic 漫画 ID，并返回下载结果。只接受纯数字 ID。',
    parameters: {
      type: 'object' as const,
      properties: {
        comicId: {
          type: 'string' as const,
          description: 'JMComic 漫画 ID，例如 123456',
        },
      },
      required: ['comicId'],
      additionalProperties: false,
    },
  };

  constructor(
    private readonly downloadService: JmcomicDownloadService,
    private readonly registry: AgentToolRegistryService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(args: unknown): Promise<AgentToolResult> {
    const comicId = (args as JmcomicArgs | undefined)?.comicId?.trim();
    if (!comicId || !/^\d{1,12}$/.test(comicId)) {
      return { content: '漫画 ID 必须是 1 到 12 位数字。' };
    }

    const result = await this.downloadService.downloadComic(comicId);
    return {
      content: JSON.stringify({ comicId, ...result }),
    };
  }
}
