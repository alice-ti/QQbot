import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 使用 express.json() 中间件，确保可以解析请求体
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        // 存储原始请求体
        req.rawBody = buf.toString();
      },
    }),
  );

  // 从 dist 目录向上两级到父目录，然后进入 download 目录
  app.useStaticAssets(join(__dirname, '..', '..', '..', 'download'), {
    prefix: '/images/', // 静态文件访问前缀
  });

  app.setGlobalPrefix('api'); // 配置全局前缀
  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '0.0.0.0');
}
bootstrap();
