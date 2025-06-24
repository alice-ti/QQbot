import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ComicDownloadService } from './jmcomic-download.service';
import type { DownloadResult } from './dto/jmcomic-download.dto';

@Controller('comic')
export class JmcomicController {
  constructor(private readonly comicDownloadService: ComicDownloadService) {}

  @Post('download')
  async downloadJmcomic(
    @Body() body: { comicId: string },
  ): Promise<DownloadResult> {
    const { comicId } = body;
    return await this.comicDownloadService.downloadComic(comicId);
  }

  @Get('files/:comicId')
  async getComicFiles(@Param('comicId') comicId: string) {
    const files = await this.comicDownloadService.getComicFiles(comicId);
    return { comicId, files, count: files.length };
  }
}
