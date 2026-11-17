import { Test, TestingModule } from '@nestjs/testing';
import { JmcomicController } from './jmcomic.controller.js';
import { JmcomicDownloadService } from './jmcomic-download.service.js';
import { JmcomicImageService } from './jmcomic-image.service.js';

describe('JmcomicController', () => {
  let controller: JmcomicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JmcomicController],
      providers: [
        { provide: JmcomicDownloadService, useValue: {} },
        { provide: JmcomicImageService, useValue: {} },
      ],
    }).compile();

    controller = module.get<JmcomicController>(JmcomicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
