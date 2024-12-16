import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';
import { BaseMessage } from './bot.message.dto';
import { botConfig } from '../config';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private accessToken: string;
  private tokenExpireTime: number;

  async onModuleInit() {
    try {
      this.getAccessToken();
    } catch (error) {
      this.logger.error('初始化机器人时出错:', error);
    }
  }

  // 获取访问令牌
  async getAccessToken() {
    try {
      const response = await axios.post(
        'https://bots.qq.com/app/getAppAccessToken',
        {
          appId: botConfig.appId,
          clientSecret: botConfig.clientSecret,
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = Date.now() + response.data.expires_in * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('获取 access token 失败:', error);
      throw error;
    }
  }

  // 发送消息
  async sendMessage(group_openid: string, content: BaseMessage) {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      await this.getAccessToken();
    }

    try {
      const response = await axios.post(
        `https://api.sgroup.qq.com/v2/groups/${group_openid}/messages`,
        content,
        {
          headers: {
            Authorization: `QQBot ${this.accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }
}
