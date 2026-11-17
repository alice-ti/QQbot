import { Test, TestingModule } from '@nestjs/testing';
import { BotController } from './bot.controller.js';
import { BotService } from './services/bot.service.js';
import { JmCommandHandler } from './handlers/jm-command.handler.js';
import { TTSCommandHandler } from './handlers/tts-command.handler.js';
import { SongCommandHandler } from './handlers/song-command.handler.js';
import { AgentService } from '../agent/agent.service.js';

describe('BotController', () => {
  let controller: BotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotController],
      providers: [
        { provide: BotService, useValue: {} },
        { provide: JmCommandHandler, useValue: {} },
        { provide: TTSCommandHandler, useValue: {} },
        { provide: SongCommandHandler, useValue: {} },
        { provide: AgentService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BotController>(BotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
