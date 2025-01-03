import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { TtsModule } from './modules/tts/tts.module';
import { SignatureMiddleware } from './middleware/signature/signature.middleware';
// import { QQSignatureMiddleware } from './middleware/auth/qqsignature.middleware';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // .apply(QQSignatureMiddleware, SignatureMiddleware)
      .apply(SignatureMiddleware)
      .forRoutes('bot/webhook'); // 应用到 webhook 路由
  }
}
