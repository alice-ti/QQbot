export interface CommandHandler {
  handle(params: {
    content: string;
    groupOpenid: string;
    messageId: string;
  }): Promise<void>;
}
