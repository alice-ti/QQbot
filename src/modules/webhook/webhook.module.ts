import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookMiddleware } from './webhook.middleware.js';
import { WebhookService } from './webhook.service.js';

@Module({
  imports: [ConfigModule],
  providers: [WebhookService, WebhookMiddleware],
  exports: [WebhookService, WebhookMiddleware],
})
export class WebhookModule {}
