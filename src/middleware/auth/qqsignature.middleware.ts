import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as nacl from 'tweetnacl';

// 定义 KeyPair 接口
interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

// 辅助函数：将十六进制字符串转换为 Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
  const pairs = hexString.match(/[\dA-F]{2}/gi);
  if (!pairs) {
    throw new Error('Invalid hex string');
  }
  return new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));
}

@Injectable()
export class QQSignatureMiddleware implements NestMiddleware {
  private readonly botSecret: string = 'naOC0ocQE3shWLAfffVLB1rhYPG7';
  constructor() {}

  private generateKeyPair(botSecret: string): KeyPair {
    // 生成seed
    let seed = botSecret;
    while (seed.length < 32) {
      seed = seed.repeat(2);
    }
    seed = seed.substring(0, 32);

    // console.log('QQSignatureMiddleware-Seed:', seed);

    // 将seed转换为Uint8Array
    const seedBytes = new TextEncoder().encode(seed);

    // 生成密钥对
    return nacl.sign.keyPair.fromSeed(seedBytes);
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('QQSignatureMiddleware-Request:', req.headers);
      console.log('QQSignatureMiddleware-Body:', req.body);
      // 获取请求头中的签名和时间戳
      const signature = req.header('X-Signature-Ed25519');
      const timestamp = req.header('X-Signature-Timestamp');

      if (!signature || !timestamp) {
        throw new HttpException(
          'Missing signature headers',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 获取请求体
      const body = JSON.stringify(req.body);

      // 组合消息
      const message = new TextEncoder().encode(`${timestamp}${body}`);

      console.log('Timestamp:', timestamp);
      console.log('Body:', body);
      console.log('Combined message:', `${timestamp}${body}`);

      // 解码签名
      const signatureBytes = hexToUint8Array(signature);

      // 生成密钥对
      const keyPair = this.generateKeyPair(this.botSecret);

      // 验证签名
      const isValid = nacl.sign.detached.verify(
        message,
        signatureBytes,
        keyPair.publicKey,
      );

      console.log('QQSignatureMiddleware-isValid:', isValid);

      if (!isValid) {
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      next();
    } catch (error) {
      console.log('Error:', error);
      throw new HttpException(
        'Signature verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
