import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import type { DownloadResult } from './dto/jmcomic-download.dto';
import * as fs from 'fs';
import { join } from 'path';
import * as glob from 'glob';

@Injectable()
export class JmcomicDownloadService {
  private readonly PDF_BASE_DIR: string;

  private readonly logger = new Logger(JmcomicDownloadService.name);
  private readonly condaScript = join(
    process.cwd(),
    'scripts',
    'activate_conda.sh',
  );
  private readonly pythonScript = join(
    process.cwd(),
    'scripts',
    'download_jm.py',
  );
  private readonly downloadDir = join(process.cwd(), 'downloads');

  constructor() {
    this.PDF_BASE_DIR = join(process.cwd(), '..', 'downloads', 'pdfs');
  }

  /**
   * 从混合的输出中提取JSON结果
   * @param stdout 完整的标准输出内容
   * @returns 解析后的JSON对象
   */
  private extractJsonResult(stdout: string): DownloadResult {
    // 查找最后一个JSON对象
    // 使用正则表达式匹配JSON格式的内容
    const jsonMatches = stdout.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);

    if (!jsonMatches || jsonMatches.length === 0) {
      throw new Error('未找到有效的JSON输出');
    }

    // 取最后一个匹配的JSON（通常是我们的结果）
    const lastJson = jsonMatches[jsonMatches.length - 1];

    try {
      const result = JSON.parse(lastJson);
      return result as DownloadResult;
    } catch (error) {
      throw new Error(`JSON解析失败: ${error.message}`);
    }
  }

  /**
   * @description 下载指定漫画 使用[JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python)
   * @param comicId
   * @returns
   */
  async downloadComic(comicId: string): Promise<DownloadResult> {
    return new Promise((resolve, reject) => {
      // 直接调用激活脚本，传递 Python 脚本和参数
      const pythonProcess = spawn('bash', [
        this.condaScript,
        this.pythonScript,
        comicId,
        this.downloadDir,
      ]);

      // Windows 调试使用
      // const pythonProcess = spawn('python', [
      //   this.pythonScript,
      //   comicId,
      //   this.downloadDir,
      // ]);

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
            this.logger.debug('Python脚本完整输出:', stdout);

            // 提取JSON结果
            const result = this.extractJsonResult(stdout);
            this.logger.log('提取的下载结果:', result);

            if (result?.success) {
              this.renamePdfFile(comicId);
            }

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

  async renamePdfFile(comicId: string): Promise<string> {
    const dirPath = join(this.PDF_BASE_DIR, comicId);
    let files = fs.readdirSync(dirPath);

    console.log('PDF file :', fs.readdirSync(dirPath));

    if (!files) {
      return '未找到对应的文件';
    }

    let fileName = files[0];
    let fullPath = join(dirPath, fileName);

    if (!fileName.endsWith('.pdf')) {
      const newFileName = fileName + '.pdf';
      const newFullPath = join(dirPath, newFileName);

      console.log('Renaming file from:', fullPath);
      console.log('Renaming file to:', newFullPath);

      fs.renameSync(fullPath, newFullPath);
    }
  }

  // TODO ? 获取漫画文件列表
}
