import { AgentService } from './agent.service.js';
import { AgentToolRegistryService } from './agent-tool-registry.service.js';
import { ConversationMemoryService } from './memory/conversation-memory.service.js';
import type {
  AgentCompletion,
  AgentProvider,
  AgentTool,
} from './interfaces/index.js';

describe('AgentService', () => {
  it('executes a registered tool and keeps the final answer in session memory', async () => {
    const completions: AgentCompletion[] = [
      {
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call-1',
              type: 'function',
              function: {
                name: 'test_tool',
                arguments: JSON.stringify({ value: 'hello' }),
              },
            },
          ],
        },
      },
      {
        message: {
          role: 'assistant',
          content: 'Tool execution complete',
        },
      },
    ];
    let completionIndex = 0;
    const provider: AgentProvider = {
      complete: async () => completions[completionIndex++],
    };
    const memory = new ConversationMemoryService();
    const registry = new AgentToolRegistryService();
    let executedArgs: unknown;
    const tool: AgentTool = {
      definition: {
        name: 'test_tool',
        description: 'test tool',
        parameters: { type: 'object' },
      },
      execute: async (args) => {
        executedArgs = args;
        return { content: 'tool result' };
      },
    };
    registry.register(tool);
    const config = { get: () => 'test-app' };
    const service = new AgentService(
      provider,
      memory,
      registry,
      config as never,
    );

    await expect(
      service.reply({
        content: 'call the tool',
        groupOpenid: 'group-1',
        messageId: 'message-1',
      }),
    ).resolves.toBe('Tool execution complete');

    expect(executedArgs).toEqual({ value: 'hello' });
    expect(completionIndex).toBe(2);
    expect(memory.get('qqbot:test-app:group:group-1')).toEqual([
      { role: 'user', content: 'call the tool' },
      { role: 'assistant', content: 'Tool execution complete' },
    ]);
  });
});
