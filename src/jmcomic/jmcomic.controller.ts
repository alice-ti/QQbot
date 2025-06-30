import { Controller, Post, Body, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { JmcomicDownloadService } from './jmcomic-download.service';
import { JmcomicImageService } from './jmcomic-image.service';
import type { DownloadResult } from './dto/jmcomic-download.dto';

@Controller('comic')
export class JmcomicController {
  constructor(
    private readonly comicDownloadService: JmcomicDownloadService,
    private readonly comicImageService: JmcomicImageService,
  ) {}

  // 279464
  @Get('download/:comicId')
  async getDownload(
    @Param('comicId') comicId: string,
  ): Promise<DownloadResult> {
    return await this.comicDownloadService.downloadComic(comicId);
  }

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

  @Get('getImage/*')
  async getImage(@Param('0') filePath: string, @Res() res: Response) {
    const fileInfo = await this.comicImageService.getImageFile(filePath);

    // 设置响应头
    res.setHeader('Content-Type', fileInfo.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // 发送文件
    return res.sendFile(fileInfo.filePath);
  }

  // PDF路由
  @Get('getPdf/*')
  async getPdf(@Param('0') filePath: string, @Res() res: Response) {
    const fileInfo = await this.comicImageService.getPdfFile(filePath);

    res.setHeader('Content-Type', fileInfo.contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(fileInfo.fileName)}"`,
    );
    res.setHeader('Cache-Control', 'public, max-age=7200'); // PDF缓存2小时
    res.setHeader('Accept-Ranges', 'bytes'); // 支持范围请求，有利于大文件传输

    return res.sendFile(fileInfo.filePath);
  }
}
