import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class AudioConverterService {
  private readonly TEMP_DIR: string;
  private readonly ffmpegPath: string;
  constructor(private configService: ConfigService) {
    this.TEMP_DIR = this.configService.get<string>('AUDIO_TEMP_DIR');
    this.ffmpegPath = this.configService.get<string>('FFMPEG_PATH');
  }

  // 检查 FFmpeg 是否可用
  async checkFFmpegInstallation() {
    try {
      const { stdout } = await execPromise(
        `"${this.ffmpegPath}ffmpeg.exe" -version`,
      );
      console.log('FFmpeg 版本信息:', stdout);
      return true;
    } catch (error) {
      console.error('FFmpeg 检查失败:', error);
      return false;
    }
  }

  async convertToSilk(inputFilePath: string): Promise<string> {
    try {
      const ffmpegAvailable = await this.checkFFmpegInstallation();
      if (!ffmpegAvailable) {
        throw new Error('FFmpeg 未正确安装或配置');
      }

      // 临时文件路径
      const tempDir = this.TEMP_DIR;

      const fileName = path.basename(inputFilePath, '.mp3');
      const pcmPath = path.join(tempDir, `${fileName}.pcm`);
      const silkPath = path.join(tempDir, `${fileName}.silk`);

      console.log('Mp3文件路径:', fileName);

      // 第一步：将 MP3 转换为 PCM
      const ffmpegCommand = `"${this.ffmpegPath}ffmpeg.exe" -i "${inputFilePath}" -f s16le -ar 24000 -ac 1 -acodec pcm_s16le "${pcmPath}"`;

      console.log('执行命令1:', ffmpegCommand);

      const { stderr } = await execPromise(ffmpegCommand);

      if (stderr) {
        console.log('FFmpeg stderr:', stderr); // 添加错误日志
      }

      // 第二步：将 PCM 转换为 Silk
      const silkCommand = `${this.ffmpegPath}silk_v3_encoder.exe "${pcmPath}" "${silkPath}" -tencent`;
      console.log('执行命令2:', silkCommand);
      await execPromise(silkCommand);

      // 清理临时 PCM 文件
      fs.unlinkSync(pcmPath);
      return silkPath;
    } catch (error) {
      throw new Error(`转换失败: ${error.message}`);
    }
  }

  // 清理生成的文件
  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`清理文件失败: ${error.message}`);
    }
  }
}
