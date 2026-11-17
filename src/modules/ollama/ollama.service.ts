import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

@Injectable()
export class OllamaService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // 默认 Ollama 运行在 localhost:11434
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  }

  async generateResponse(request: OllamaRequest): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<OllamaResponse>(
          `${this.baseUrl}/api/generate`,
          {
            model: request.model,
            prompt: request.prompt,
            stream: false, // 设置为 false 获取完整响应
            options: request.options || {},
          },
          {
            timeout: 30000, // 30秒超时
          },
        ),
      );

      return response.data.response;
    } catch (error) {
      throw new HttpException(
        `Ollama 服务错误: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ models: Array<{ name: string }> }>(
          `${this.baseUrl}/api/tags`,
        ),
      );
      return response.data.models.map((model: any) => model.name);
    } catch (error) {
      throw new HttpException(
        `获取模型列表失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/pull`, {
          name: modelName,
        }),
      );
    } catch (error) {
      throw new HttpException(
        `拉取模型失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
