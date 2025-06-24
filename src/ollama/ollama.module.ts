import { Module } from '@nestjs/common';
import { OllamaController } from './ollama.controller';
import { OllamaService } from './ollama.service';

@Module({
  controllers: [OllamaController],
  providers: [OllamaService],
  exports: [OllamaService], // 导出服务供其他模块使用
})
export class OllamaModule {}
