import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as nacl from 'tweetnacl';

@Injectable()
export class QQSignatureMiddleware implements NestMiddleware {
  private botSecret: string;

  constructor(private configService: ConfigService) {
    this.botSecret = this.configService.get<string>('QQ_SECRET');
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-signature-ed25519'] as string;
      const timestamp = req.headers['x-signature-timestamp'] as string;
      const body = JSON.stringify(req.body);

      if (!signature || !timestamp) {
        return res.status(401).json({ error: 'Missing signature headers' });
      }

      if (!this.botSecret) {
        return res.status(500).json({ error: 'Bot secret not configured' });
      }

      // 生成签名种子
      let seed = this.botSecret;
      while (seed.length < 32) {
        seed = seed.repeat(2);
      }
      seed = seed.slice(0, 32);

      // 生成密钥对
      const seedUint8Array = new TextEncoder().encode(seed);
      const keyPair = nacl.sign.keyPair.fromSeed(seedUint8Array);

      // 构建签名消息
      const msg = `${timestamp}${body}`;
      const msgUint8 = new TextEncoder().encode(msg);

      // 将十六进制签名转换为 Uint8Array
      const signatureUint8 = new Uint8Array(Buffer.from(signature, 'hex'));

      // 验证签名
      const isValid = nacl.sign.detached.verify(
        msgUint8,
        signatureUint8,
        keyPair.publicKey,
      );

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
      console.log('签名验证成功');

      next();
    } catch (error) {
      console.error('Signature verification error:', error);
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  }
}
