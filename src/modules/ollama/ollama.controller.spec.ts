import { Test, TestingModule } from '@nestjs/testing';
import { OllamaController } from './ollama.controller.js';
import { OllamaService } from './ollama.service.js';

describe('OllamaController', () => {
  let controller: OllamaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OllamaController],
      providers: [{ provide: OllamaService, useValue: {} }],
    }).compile();

    controller = module.get<OllamaController>(OllamaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
