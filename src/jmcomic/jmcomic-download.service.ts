import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import type { DownloadResult } from './dto/jmcomic-download.dto';

@Injectable()
export class ComicDownloadService {
  private readonly logger = new Logger(ComicDownloadService.name);
  private readonly pythonScript = path.join(
    process.cwd(),
    'scripts',
    'download_jm.py',
  );
  private readonly downloadDir = path.join(process.cwd(), 'downloads');

  /**
   * @description 下载指定漫画 使用[JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python)
   * @param comicId
   * @returns
   */
  async downloadComic(comicId: string): Promise<DownloadResult> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        this.pythonScript,
        comicId,
        this.downloadDir,
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            this.logger.log(`漫画 ${comicId} 下载结果:`, result);
            resolve(result);
          } catch (error) {
            reject(new Error(`解析Python输出失败: ${error.message}`));
          }
        } else {
          this.logger.error(`Python脚本执行失败: ${stderr}`);
          reject(new Error(`下载失败: ${stderr}`));
        }
      });
    });
  }

  // 获取漫画文件列表
  async getComicFiles(comicId: string): Promise<string[]> {
    const comicDir = path.join(this.downloadDir, `JM${comicId}`);

    try {
      await fs.access(comicDir);
      const files = await fs.readdir(comicDir, { recursive: true });

      // 过滤图片文件
      const imageFiles = files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.toString()))
        .map((file) => path.join(comicDir, file.toString()));

      return imageFiles;
    } catch (error) {
      this.logger.error(`获取漫画文件失败: ${error.message}`);
      return [];
    }
  }
}
