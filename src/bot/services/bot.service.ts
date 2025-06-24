import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';
import { BaseMessage } from '../dto/bot.message.dto';
import { TtsService } from '../../modules/tts/tts.service';
import { MusicService } from '../../modules/music/music.service';
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
    private readonly audioConverterService: AudioConverterService,
    private readonly ttsService: TtsService,
    private readonly musicService: MusicService,
    private readonly configService: ConfigService,
  ) {
    this.TEMP_DIR = this.configService.get<string>('AUDIO_TEMP_DIR');
    this.NGROK_URL = this.configService.get<string>('NGROK_PATH');
    this.botConfig = {
      appId: this.configService.get<string>('QQ_APPID'),
      clientSecret: this.configService.get<string>('QQ_SECRET'),
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

  // 发送点歌消息
  async sendSongMessage(group_openid: string, message?: BaseMessage) {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      await this.getAccessToken();
    }

    try {
      const [source, songName] = message?.content
        .replace('/SONG', '')
        .trim()
        .split('#');

      if (!songName) {
        await this.sendMessage(group_openid, {
          msg_type: 0,
          content: '请输入歌曲名称，格式：/SONG 歌曲名',
          msg_id: message?.msg_id,
        });
        return;
      }

      // 搜索歌曲
      const songs = await this.musicService.searchSong(songName, source);
      if (!songs || songs.length === 0) {
        await this.sendMessage(group_openid, {
          msg_type: 0,
          content: `未找到歌曲: ${songName}`,
          msg_id: message?.msg_id,
        });
        return;
      }

      // 获取第一首歌
      const song = songs[0];

      // 验证必要字段
      if (!song.title || !song.jumpUrl) {
        this.logger.error('歌曲信息不完整:', song);
        await this.sendMessage(group_openid, {
          msg_type: 0,
          content: '抱歉，获取歌曲信息失败',
          msg_id: message?.msg_id,
        });
        return;
      }

      // 使用 ark 模板 1 发送音乐卡片
      const musicMessage = {
        msg_type: 3, // ark 消息类型
        msg_id: message?.msg_id,
        ark: {
          template_id: 1, // 音乐卡片模板
          kv: [
            {
              key: '#PROMPT#',
              value: '分享了一首歌曲',
            },
            {
              key: '#TITLE#',
              value: song.title,
            },
            {
              key: '#DESC#',
              value: song.singer || '未知歌手',
            },
            {
              key: '#PLAY_URL#',
              value: song.jumpUrl,
            },
            {
              key: '#COVER#',
              value:
                song.imageUrl ||
                'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
            },
          ],
        },
      };

      this.logger.debug(
        '准备发送音乐信息:',
        JSON.stringify(musicMessage, null, 2),
      );

      const response = await axios.post(
        `https://api.sgroup.qq.com/v2/groups/${group_openid}/messages`,
        musicMessage,
        {
          headers: {
            Authorization: `QQBot ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('发送音乐卡片失败:', {
        errorCode: error.response?.data?.code,
        errorMessage: error.response?.data?.message,
        errorDetails: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      // 发送错误提示
      await this.sendMessage(group_openid, {
        msg_type: 0,
        content: '抱歉，发送音乐卡片失败，请稍后重试',
        msg_id: message?.msg_id,
      });
    }
  }

  // 发送固定测试语言
  async sendTestTTSMessage(group_openid: string, message?: BaseMessage) {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      await this.getAccessToken();
    }

    let tempSilkPath: string | null = null;
    const content = message?.content;
    const tempDir = this.TEMP_DIR;

    try {
      // 使用固定的测试音频文件路径
      const testAudioPath = path.join(tempDir, `${content}.mp3`);

      // 转换为silk格式
      this.logger.debug('开始转换音频为 silk 格式...');
      const fileUrl =
        await this.audioConverterService.convertToSilk(testAudioPath);
      tempSilkPath = fileUrl;
      this.logger.debug('音频转换完成:', fileUrl);

      const uploadUrl = `${this.NGROK_URL}/${fileUrl.replace(/\\/g, '/')}`;
      this.logger.debug('准备上传音频, URL:', uploadUrl);

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
    } finally {
      // 只清理转换后的临时silk文件
      try {
        if (
          tempSilkPath &&
          (await fs.promises
            .access(tempSilkPath)
            .then(() => true)
            .catch(() => false))
        ) {
          await fs.promises.unlink(tempSilkPath);
          this.logger.debug('已清理临时 SILK 文件:', tempSilkPath);
        }
      } catch (cleanupError) {
        this.logger.error('清理临时文件失败:', cleanupError);
      }
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
      const audioBuffer = await this.ttsService.textToSpeech(textToConvert);

      // 保存为临时文件
      const tempDir = this.TEMP_DIR;

      const tempFilePath = path.join(tempDir, `audio_${Date.now()}.mp3`); // QQ语音一般使用silk格式
      await fs.promises.writeFile(tempFilePath, audioBuffer);

      tempMp3Path = tempFilePath;

      const fileUrl =
        await this.audioConverterService.convertToSilk(tempFilePath);
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
