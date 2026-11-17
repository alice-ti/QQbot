import { Controller, Post, Body, Get, Res, Param } from '@nestjs/common';
import type { Response } from 'express';
import { JmcomicDownloadService } from './jmcomic-download.service.js';
import { JmcomicImageService } from './jmcomic-image.service.js';
import type { DownloadResult } from './dto/jmcomic-download.dto.js';

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

  @Get('getImage/*splat')
  async getImage(
    @Param('splat') filePath: string | string[],
    @Res() res: Response,
  ) {
    const normalizedFilePath = Array.isArray(filePath)
      ? filePath.join('/')
      : filePath;
    const fileInfo =
      await this.comicImageService.getImageFile(normalizedFilePath);

    // 设置响应头
    res.setHeader('Content-Type', fileInfo.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // 发送文件
    return res.sendFile(fileInfo.filePath);
  }

  // PDF路由
  @Get('getPdf/*splat')
  async getPdf(
    @Param('splat') filePath: string | string[],
    @Res() res: Response,
  ) {
    const normalizedFilePath = Array.isArray(filePath)
      ? filePath.join('/')
      : filePath;
    const fileInfo =
      await this.comicImageService.getPdfFile(normalizedFilePath);

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
