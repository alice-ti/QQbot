import { Injectable } from '@nestjs/common';
import type { AgentMessage } from '../interfaces/agent-message.interface.js';

@Injectable()
export class ConversationMemoryService {
  private readonly sessions = new Map<string, AgentMessage[]>();
  private readonly lastAccess = new Map<string, number>();
  private readonly maxMessages = 20;
  private readonly maxSessions = 1000;
  private readonly idleTimeoutMs = 30 * 60 * 1000;

  get(sessionKey: string): AgentMessage[] {
    this.removeExpired();
    this.lastAccess.set(sessionKey, Date.now());
    return [...(this.sessions.get(sessionKey) ?? [])];
  }

  append(sessionKey: string, ...messages: AgentMessage[]): void {
    const current = this.sessions.get(sessionKey) ?? [];
    const next = [...current, ...messages].slice(-this.maxMessages);
    this.sessions.set(sessionKey, next);
    this.lastAccess.set(sessionKey, Date.now());
    this.removeOldestSessions();
  }

  clear(sessionKey: string): void {
    this.sessions.delete(sessionKey);
    this.lastAccess.delete(sessionKey);
  }

  private removeExpired(): void {
    const expiresBefore = Date.now() - this.idleTimeoutMs;
    for (const [sessionKey, accessedAt] of this.lastAccess) {
      if (accessedAt < expiresBefore) {
        this.clear(sessionKey);
      }
    }
  }

  private removeOldestSessions(): void {
    while (this.sessions.size > this.maxSessions) {
      const oldest = [...this.lastAccess.entries()].sort(
        ([, left], [, right]) => left - right,
      )[0]?.[0];
      if (!oldest) {
        return;
      }
      this.clear(oldest);
    }
  }
}
