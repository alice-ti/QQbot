import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';
import { BaseMessage } from './bot.message.dto';
import { TtsService } from '../modules/tts/tts.service';
import { AudioConverterService } from './ffmpeg.service';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private readonly TEMP_DIR: string;
  private readonly NGROK_URL: string;
  private readonly botConfig: {
    appId: string;
    clientSecret: string;
  };
  private accessToken: string;
  private tokenExpireTime: number;

  constructor(
    private readonly AudioConverterService: AudioConverterService,
    private readonly azureService: TtsService,
    private configService: ConfigService,
  ) {
    this.TEMP_DIR = this.configService.get<string>('AUDIO_TEMP_DIR');
    this.NGROK_URL = this.configService.get<string>('NGROK_PATH');
    this.botConfig = {
      appId: this.configService.get<string>('QQ_APP_ID'),
      clientSecret: this.configService.get<string>('QQ_CLIENT_SECRET'),
    };
  }

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
          appId: this.botConfig.appId,
          clientSecret: this.botConfig.clientSecret,
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

  // 处理TTS消息
  async sendTTSMessage(group_openid: string, message?: BaseMessage) {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      await this.getAccessToken();
    }

    let tempMp3Path: string | null = null;
    let tempSilkPath: string | null = null;

    try {
      const textToConvert = message?.content;

      // 使用Azure生成语音
      const audioBuffer = await this.azureService.textToSpeech(textToConvert);

      // 保存为临时文件
      const tempDir = this.TEMP_DIR;

      const tempFilePath = path.join(tempDir, `audio_${Date.now()}.mp3`); // QQ语音一般使用silk格式
      await fs.promises.writeFile(tempFilePath, audioBuffer);

      tempMp3Path = tempFilePath;

      const fileUrl =
        await this.AudioConverterService.convertToSilk(tempFilePath);
      tempSilkPath = fileUrl;

      // const fileUrl = 'xxx.com/uploads/audio/help.silk';

      const uploadUrl = `${this.NGROK_URL}/${fileUrl.replace(/\\/g, '/')}`;

      console.log('File URL:', fileUrl);
      console.log('File UPLOAD URL:', uploadUrl);
      // 4. 上传语音文件
      const uploadResponse = await axios
        .post(
          `https://api.sgroup.qq.com/v2/groups/${group_openid}/files`,
          {
            file_type: 3, // 3 表示语音
            url: uploadUrl, // 音频文件的URL
            srv_send_msg: false, // 设置为false，我们稍后手动发送消息
          },
          {
            headers: {
              Authorization: `QQBot ${this.accessToken}`,
            },
          },
        )
        .catch((e) => {
          throw new Error('Upload failed: ' + e);
        });
      console.log('Upload response:', uploadResponse?.data);

      // 5. 获取file_info
      const fileInfo = uploadResponse.data.file_info;

      // 6. 发送语音消息
      await axios
        .post(
          `https://api.sgroup.qq.com/v2/groups/${group_openid}/messages`,
          {
            media: {
              file_info: fileInfo,
            },
            ...message,
          },
          {
            headers: {
              Authorization: `QQBot ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        )
        .catch((e) => {
          throw new Error('Send message failed: ' + e);
        });

      // 7. 清理临时文件
      await fs.promises.unlink(tempFilePath);
    } catch (error) {
      console.error('Error sending voice message:', error);
    } finally {
      // 清理所有临时文件
      try {
        if (
          tempMp3Path &&
          (await fs.promises
            .access(tempMp3Path)
            .then(() => true)
            .catch(() => false))
        ) {
          await fs.promises.unlink(tempMp3Path);
          console.log('Cleaned up MP3 temp file:', tempMp3Path);
        }
        if (
          tempSilkPath &&
          (await fs.promises
            .access(tempSilkPath)
            .then(() => true)
            .catch(() => false))
        ) {
          await fs.promises.unlink(tempSilkPath);
          console.log('Cleaned up SILK temp file:', tempSilkPath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }
    }
  }
}
