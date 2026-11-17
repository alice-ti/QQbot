export interface AgentJsonSchema {
  type: 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array';
  description?: string;
  properties?: Record<string, AgentJsonSchema>;
  required?: string[];
  enum?: string[];
  items?: AgentJsonSchema;
  additionalProperties?: boolean;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: AgentJsonSchema;
}

export interface AgentToolContext {
  sessionKey: string;
  groupOpenid: string;
  messageId: string;
  userOpenid?: string;
  sendTts?: (text: string) => Promise<void>;
}

export interface AgentToolResult {
  content: string;
}

export interface AgentTool {
  definition: AgentToolDefinition;
  execute(args: unknown, context: AgentToolContext): Promise<AgentToolResult>;
}
