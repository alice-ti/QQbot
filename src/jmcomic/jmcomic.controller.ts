import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JmcomicDownloadService } from './jmcomic-download.service';
import type { DownloadResult } from './dto/jmcomic-download.dto';

@Controller('comic')
export class JmcomicController {
  constructor(private readonly comicDownloadService: JmcomicDownloadService) {}

  @Post('download')
  async downloadJmcomic(
    @Body() body: { comicId: string },
  ): Promise<DownloadResult> {
    const { comicId } = body;
    return await this.comicDownloadService.downloadComic(comicId);
  }

  // id: 422866
  @Get('files/:comicId')
  async getComicFiles(@Param('comicId') comicId: string) {
    const files = await this.comicDownloadService.getComicFiles(comicId);
    return { comicId, files, count: files.length };
  }
}
