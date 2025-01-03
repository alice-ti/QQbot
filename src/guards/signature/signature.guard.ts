import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import * as ed25519 from '@stablelib/ed25519';
import { decode } from '@stablelib/hex';

const ED25519_SIGNATURE_SIZE = 64;
const ED25519_SEED_SIZE = 32;

@Injectable()
export class QQBotAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const botSecret = process.env.BOT_SECRET;

    if (!botSecret) {
      throw new HttpException(
        'Bot secret not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.verifySignature(request, botSecret);
  }

  private verifySignature(req: Request, botSecret: string): boolean {
    try {
      // 1. Generate public key from bot secret
      let seed = botSecret;
      while (seed.length < ED25519_SEED_SIZE) {
        seed = seed.repeat(2);
      }
      seed = seed.substring(0, ED25519_SEED_SIZE);
      const keyPair = ed25519.generateKeyPairFromSeed(
        new TextEncoder().encode(seed),
      );

      // 2. Retrieve signature from header
      const signatureHex = req.header('X-Signature-Ed25519');
      if (!signatureHex) {
        return false;
      }
      const signature = decode(signatureHex);

      // 3. Check signature length and format
      if (
        signature.length !== ED25519_SIGNATURE_SIZE ||
        (signature[63] & 224) !== 0
      ) {
        return false;
      }

      // 4. Retrieve timestamp and body
      const timestamp = req.header('X-Signature-Timestamp');
      if (!timestamp) {
        return false;
      }

      // 获取原始请求体
      const rawBody = req.rawBody;
      if (!rawBody) {
        return false;
      }

      // 5. Construct message for verification
      const message = new TextEncoder().encode(timestamp + rawBody);

      // 6. Verify signature
      return ed25519.verify(keyPair.publicKey, message, signature);
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}
