import { Module } from '@nestjs/common';
import { JmcomicController } from './jmcomic.controller';
import { JmcomicDownloadService } from './jmcomic-download.service';

@Module({
  controllers: [JmcomicController],
  providers: [JmcomicDownloadService],
  exports: [JmcomicDownloadService],
})
export class JmcomicModule {}
