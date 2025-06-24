import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { ChatRequestDto } from './dto/chat.dto';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('chat')
  async chat(@Body() chatRequest: ChatRequestDto) {
    const response = await this.ollamaService.generateResponse({
      model: chatRequest.model,
      prompt: chatRequest.prompt,
      options: {
        temperature: chatRequest.temperature,
        top_p: chatRequest.top_p,
        top_k: chatRequest.top_k,
      },
    });

    return {
      success: true,
      data: {
        response,
        model: chatRequest.model,
      },
    };
  }

  @Get('models')
  async getModels() {
    const models = await this.ollamaService.listModels();
    return {
      success: true,
      data: models,
    };
  }

  @Post('models/:modelName/pull')
  async pullModel(@Param('modelName') modelName: string) {
    await this.ollamaService.pullModel(modelName);
    return {
      success: true,
      message: `模型 ${modelName} 拉取成功`,
    };
  }
}
