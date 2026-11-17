import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MusicModule } from '../music/music.module.js';
import { JmcomicModule } from '../jmcomic/jmcomic.module.js';
import { AgentService } from './agent.service.js';
import { AgentToolRegistryService } from './agent-tool-registry.service.js';
import { ConversationMemoryService } from './memory/conversation-memory.service.js';
import { DeepSeekProvider } from './providers/deepseek.provider.js';
import { MusicSearchTool } from './tools/music-search.tool.js';
import { TtsTool } from './tools/tts.tool.js';
import { JmcomicDownloadTool } from './tools/jmcomic-download.tool.js';

@Module({
  imports: [ConfigModule, HttpModule, MusicModule, JmcomicModule],
  providers: [
    AgentService,
    AgentToolRegistryService,
    ConversationMemoryService,
    DeepSeekProvider,
    {
      provide: 'AGENT_PROVIDER',
      useExisting: DeepSeekProvider,
    },
    MusicSearchTool,
    TtsTool,
    JmcomicDownloadTool,
  ],
  exports: [AgentService],
})
export class AgentModule {}
