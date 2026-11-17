import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service.js';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TtsService } from '../../tts/tts.service.js';
import { MusicService } from '../../music/music.service.js';
import { AudioConverterService } from './ffmpeg.service.js';

describe('BotService', () => {
  let service: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        { provide: AudioConverterService, useValue: {} },
        { provide: TtsService, useValue: {} },
        { provide: MusicService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: HttpService, useValue: {} },
      ],
    }).compile();

    service = module.get<BotService>(BotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
