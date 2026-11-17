import { WebhookMiddleware } from './webhook.middleware.js';
import { WebhookService } from './webhook.service.js';

describe('WebhookMiddleware', () => {
  it('should be defined', () => {
    expect(new WebhookMiddleware({} as WebhookService)).toBeDefined();
  });

  it('responds to QQ validation events without invoking the bot handler', () => {
    const validationResponse = {
      plain_token: 'plain-token',
      signature: 'signature',
    };
    let validationArguments: [string, string] | undefined;
    const webhookService = {
      createValidationResponse: (eventTs: string, plainToken: string) => {
        validationArguments = [eventTs, plainToken];
        return validationResponse;
      },
    } as unknown as WebhookService;
    const middleware = new WebhookMiddleware(webhookService);
    let responseBody: unknown;
    const response = {
      json: (body: unknown) => {
        responseBody = body;
        return response;
      },
    } as any;
    let nextCalls = 0;
    const next = () => {
      nextCalls += 1;
    };

    middleware.use(
      {
        body: {
          d: { event_ts: 'event-ts', plain_token: 'plain-token' },
        },
      } as any,
      response,
      next,
    );

    expect(validationArguments).toEqual(['event-ts', 'plain-token']);
    expect(responseBody).toEqual(validationResponse);
    expect(nextCalls).toBe(0);
  });

  it('passes ordinary events to the bot handler', () => {
    const middleware = new WebhookMiddleware({} as WebhookService);
    let nextCalls = 0;
    const next = () => {
      nextCalls += 1;
    };

    middleware.use(
      { body: { t: 'GROUP_AT_MESSAGE_CREATE' } } as any,
      {} as any,
      next,
    );

    expect(nextCalls).toBe(1);
  });
});
