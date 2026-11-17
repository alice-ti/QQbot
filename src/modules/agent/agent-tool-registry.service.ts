import { Injectable, Logger } from '@nestjs/common';
import type {
  AgentTool,
  AgentToolContext,
  AgentToolDefinition,
  AgentToolResult,
} from './interfaces/agent-tool.interface.js';

@Injectable()
export class AgentToolRegistryService {
  private readonly logger = new Logger(AgentToolRegistryService.name);
  private readonly tools = new Map<string, AgentTool>();

  register(tool: AgentTool): void {
    if (this.tools.has(tool.definition.name)) {
      throw new Error(`Agent tool already registered: ${tool.definition.name}`);
    }
    this.tools.set(tool.definition.name, tool);
  }

  getDefinitions(): AgentToolDefinition[] {
    return [...this.tools.values()].map((tool) => tool.definition);
  }

  async execute(
    name: string,
    args: unknown,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { content: `未知工具：${name}` };
    }

    try {
      return await tool.execute(args, context);
    } catch (error) {
      this.logger.error(
        `Agent tool failed: ${name}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        content: `工具 ${name} 执行失败：${
          error instanceof Error ? error.message : '未知错误'
        }`,
      };
    }
  }
}
