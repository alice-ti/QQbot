import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OllamaController } from './ollama.controller.js';
import { OllamaService } from './ollama.service.js';

@Module({
  imports: [HttpModule],
  controllers: [OllamaController],
  providers: [OllamaService],
  exports: [OllamaService], // 导出服务供其他模块使用
})
export class OllamaModule {}
