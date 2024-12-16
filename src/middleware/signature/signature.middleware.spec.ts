import { SignatureMiddleware } from './signature.middleware';

describe('SignatureMiddleware', () => {
  it('should be defined', () => {
    expect(new SignatureMiddleware()).toBeDefined();
  });
});
