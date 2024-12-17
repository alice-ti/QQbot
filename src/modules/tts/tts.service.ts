import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

@Injectable()
export class TtsService {
  private speechConfig: sdk.SpeechConfig;

  constructor(private configService: ConfigService) {
    // 从环境变量获取配置
    const subscriptionKey = this.configService.get<string>('AZURE_TTS_KEY');
    const region = this.configService.get<string>('AZURE_TTS_REGION');

    // 初始化 Azure TTS 配置
    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region,
    );
    this.speechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoxiaoNeural'; // 设置默认语音
  }

  async textToSpeech(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 创建音频输出流
      const audioOutputStream = sdk.AudioOutputStream.createPullStream();

      // 创建音频配置
      const audioConfig = sdk.AudioConfig.fromStreamOutput(audioOutputStream);

      // 创建语音合成器
      const synthesizer = new sdk.SpeechSynthesizer(
        this.speechConfig,
        audioConfig,
      );

      // 开始语音合成
      synthesizer.speakTextAsync(
        text,
        (result) => {
          const { audioData } = result;

          synthesizer.close();

          // 返回音频数据
          resolve(Buffer.from(audioData));
        },
        (error) => {
          synthesizer.close();
          reject(error);
        },
      );
    });
  }
}
