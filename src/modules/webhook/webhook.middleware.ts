import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { WebhookService } from './webhook.service.js';

/**
 * QQ 回调协议层。
 *
 * 验证事件直接在这里返回响应；普通事件调用 next()，继续交给
 * BotController 处理业务消息。
 */
@Injectable()
export class WebhookMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebhookMiddleware.name);

  constructor(private readonly webhookService: WebhookService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const validationPayload = req.body?.d;
      if (validationPayload?.plain_token && validationPayload?.event_ts) {
        return res.json(
          this.webhookService.createValidationResponse(
            validationPayload.event_ts,
            validationPayload.plain_token,
          ),
        );
      }

      next();
    } catch (error) {
      this.logger.error(
        'QQ webhook validation failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        'Signature verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
