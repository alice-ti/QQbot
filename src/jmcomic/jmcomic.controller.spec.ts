import { Test, TestingModule } from '@nestjs/testing';
import { JmcomicController } from './jmcomic.controller';

describe('JmcomicController', () => {
  let controller: JmcomicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JmcomicController],
    }).compile();

    controller = module.get<JmcomicController>(JmcomicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
