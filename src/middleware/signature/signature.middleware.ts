import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as nacl from 'tweetnacl';

// 辅助函数：将 Uint8Array 转换为十六进制字符串
function toHex(buffer: Uint8Array): string {
  return Array.prototype.map
    .call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

@Injectable()
export class SignatureMiddleware implements NestMiddleware {
  private botSecret: string;
  constructor(private configService: ConfigService) {
    this.botSecret = this.configService.get<string>('QQ_SECRET');
  }

  // 验证 Webhook 回调
  verifyWebhookCallback(req: Request, res: Response) {
    if (req.body?.d?.plain_token) {
      const validationPayload = req.body?.d;

      // 生成签名
      let seed = this.botSecret;
      while (seed.length < 32) {
        seed = seed.repeat(2);
      }
      seed = seed.slice(0, 32);

      // 生成密钥对
      const seedUint8Array = new TextEncoder().encode(seed);
      const keyPair = nacl.sign.keyPair.fromSeed(seedUint8Array);

      // 准备消息
      const message = new TextEncoder().encode(
        validationPayload.event_ts + validationPayload.plain_token,
      );

      // 生成签名
      const signature = nacl.sign.detached(message, keyPair.secretKey);

      // 编码签名为十六进制字符串
      const signatureHex = toHex(signature);

      console.log('Mid-Secret:', this.botSecret);
      console.log('Mid-Seed:', seed);
      console.log(
        'Mid-Message:',
        validationPayload.event_ts + validationPayload.plain_token,
      );
      console.log('Mid-Signature:', signatureHex);

      const response = {
        plain_token: validationPayload.plain_token,
        signature: signatureHex,
      };

      return res.json(response);
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('SignatureMiddleware Header', req?.headers);
      console.log('SignatureMiddleware Body', req?.body);

      // 处理 webhook 回调
      const callbackResponse = this.verifyWebhookCallback(req, res);
      if (callbackResponse) {
        return callbackResponse;
      }

      next();
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Signature verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
