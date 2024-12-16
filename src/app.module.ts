import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { WebhookModule } from './webhook/webhook.module';
import { SignatureMiddleware } from './middleware/signature/signature.middleware';

@Module({
  imports: [BotModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SignatureMiddleware).forRoutes('bot/webhook'); // 应用到 webhook 路由
  }
}
