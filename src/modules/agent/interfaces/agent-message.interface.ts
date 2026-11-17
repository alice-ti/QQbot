export type AgentMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface AgentToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AgentMessage {
  role: AgentMessageRole;
  content: string | null;
  tool_calls?: AgentToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface AgentCompletion {
  message: AgentMessage;
  finishReason?: string;
}
