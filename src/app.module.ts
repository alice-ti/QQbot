import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BotModule } from './modules/bot/bot.module.js';
import { TtsModule } from './modules/tts/tts.module.js';
import { MusicModule } from './modules/music/music.module.js';
import { OllamaModule } from './modules/ollama/ollama.module.js';
import { JmcomicModule } from './modules/jmcomic/jmcomic.module.js';
import { WebhookModule } from './modules/webhook/webhook.module.js';
import { WebhookMiddleware } from './modules/webhook/webhook.middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    TtsModule,
    MusicModule,
    OllamaModule,
    JmcomicModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WebhookMiddleware).forRoutes('bot/webhook');
  }
}
