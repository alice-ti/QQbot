import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly publicKey: crypto.KeyObject;
  private readonly botSecret: string = '0gM3kR8pXFxfN5oXGziRBvfP9tePAvgR';

  constructor() {
    // 生成 seed
    let seed = this.botSecret;
    while (seed.length < 32) {
      seed = seed + seed;
    }
    seed = seed.slice(0, 32);

    // 根据 seed 生成密钥对
    const keyPair = crypto.generateKeyPairSync('ed25519', {
      seed: Buffer.from(seed),
    });

    // 将原始公钥转换为 KeyObject
    this.publicKey = keyPair.publicKey;
  }

  verifySignature(signature: string, timestamp: string, body: string): boolean {
    try {
      // 解码签名
      const decodedSignature = Buffer.from(signature, 'hex');

      // 验证签名长度
      if (
        decodedSignature.length !== 64 ||
        (decodedSignature[63] & 224) !== 0
      ) {
        return false;
      }

      // 组合消息
      const message = Buffer.from(timestamp + body);

      // 验证签名
      return crypto.verify(
        'ed25519', // 指定算法
        message,
        this.publicKey,
        decodedSignature,
      );
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }
}
