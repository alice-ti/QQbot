import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 使用 express.json() 中间件，确保可以解析请求体
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        // 存储原始请求体
        req.rawBody = buf;
      },
    }),
  );

  app.setGlobalPrefix('api'); // 配置全局前缀
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
