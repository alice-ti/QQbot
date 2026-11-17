import { Module } from '@nestjs/common';
import { JmcomicController } from './jmcomic.controller.js';
import { JmcomicImageService } from './jmcomic-image.service.js';
import { JmcomicDownloadService } from './jmcomic-download.service.js';

@Module({
  controllers: [JmcomicController],
  providers: [JmcomicDownloadService, JmcomicImageService],
  exports: [JmcomicDownloadService],
})
export class JmcomicModule {}
