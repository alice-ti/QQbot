import {
  Controller,
  Get,
  Req,
  Headers,
  RawBodyRequest,
  HttpCode,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  private readonly botSecret: string = '0gM3kR8pXFxfN5oXGziRBvfP9tePAvgR';

  @Get('/test')
  async test() {
    return 'Hello World! 1';
  }

  @Post('/callback')
  @HttpCode(200)
  async handleValidation(
    @Headers('x-signature-ed25519') signature: string,
    @Headers('x-signature-timestamp') timestamp: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    try {
      // 获取原始body
      const rawBody = request.rawBody?.toString() || '';

      // 验证签名
      const isValid = await this.webhookService.verifySignature(
        signature,
        timestamp,
        rawBody,
      );

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // 处理webhook逻辑...
      return { success: true };
    } catch (error) {
      console.error('Webhook handler error:', error);
      throw new UnauthorizedException('Signature verification failed');
    }
  }
}
