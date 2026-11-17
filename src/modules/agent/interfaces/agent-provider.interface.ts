import type {
  AgentCompletion,
  AgentMessage,
} from './agent-message.interface.js';
import type { AgentToolDefinition } from './agent-tool.interface.js';

export interface AgentProvider {
  complete(
    messages: AgentMessage[],
    tools: AgentToolDefinition[],
  ): Promise<AgentCompletion>;
}
