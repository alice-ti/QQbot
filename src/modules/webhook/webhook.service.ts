import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nacl from 'tweetnacl';

export interface WebhookValidationResponse {
  plain_token: string;
  signature: string;
}

@Injectable()
export class WebhookService {
  private readonly botSecret: string;

  constructor(private readonly configService: ConfigService) {
    const botSecret = this.configService.get<string>('QQ_SECRET');
    if (!botSecret) {
      throw new Error('QQ_SECRET is not configured');
    }
    this.botSecret = botSecret;
  }

  createValidationResponse(
    eventTs: string,
    plainToken: string,
  ): WebhookValidationResponse {
    const keyPair = nacl.sign.keyPair.fromSeed(this.getSeed());
    const message = new TextEncoder().encode(eventTs + plainToken);
    const signature = nacl.sign.detached(message, keyPair.secretKey);

    return {
      plain_token: plainToken,
      signature: Buffer.from(signature).toString('hex'),
    };
  }

  verifySignature(
    signature: string,
    timestamp: string,
    rawBody: string,
  ): boolean {
    try {
      const decodedSignature = Buffer.from(signature, 'hex');
      if (decodedSignature.length !== 64) {
        return false;
      }

      const keyPair = nacl.sign.keyPair.fromSeed(this.getSeed());
      const message = new TextEncoder().encode(timestamp + rawBody);

      return nacl.sign.detached.verify(
        message,
        decodedSignature,
        keyPair.publicKey,
      );
    } catch {
      return false;
    }
  }

  private getSeed(): Uint8Array {
    let seed = this.botSecret;
    while (seed.length < 32) {
      seed = seed.repeat(2);
    }
    return new TextEncoder().encode(seed.slice(0, 32));
  }
}
