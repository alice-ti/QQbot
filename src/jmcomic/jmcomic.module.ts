import { Module } from '@nestjs/common';
import { JmcomicController } from './jmcomic.controller';
import { JmcomicImageService } from './jmcomic-image.service';
import { JmcomicDownloadService } from './jmcomic-download.service';

@Module({
  controllers: [JmcomicController],
  providers: [JmcomicDownloadService, JmcomicImageService],
  exports: [JmcomicDownloadService],
})
export class JmcomicModule {}
