import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotService } from '../services/bot.service';
import { CommandHandler } from '../interfaces/command-handler.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

@Injectable()
export class JmCommandHandler implements CommandHandler {
  private readonly JMCOMIC_URL: string;
  private readonly PDF_BASE_DIR: string;

  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
  ) {
    this.JMCOMIC_URL = this.configService.get<string>('JMCOMIC_URL');
    this.PDF_BASE_DIR = path.resolve(__dirname, '../../../downloads/pdfs');
  }

  async handle({
    content,
    groupOpenid,
    messageId,
  }: {
    content: string;
    groupOpenid: string;
    messageId: string;
  }): Promise<void> {
    const cleanContent = content.replace('/TTS', '').trim();
    const comicId = cleanContent.match(/(\d+)/)?.[0];

    if (!comicId) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '请提供正确的漫画ID',
        msg_id: messageId,
      });
      return;
    }

    // 匹配本地pdf目录
    const pdfDirPattern = path.join(this.PDF_BASE_DIR, `${comicId}_*`);
    const pdfDirs = glob.sync(pdfDirPattern);
    if (pdfDirs.length === 0) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '未找到对应的PDF文件目录',
        msg_id: messageId,
      });
      return;
    }

    const pdfDir = pdfDirs[0];
    // 匹配目录下所有文件
    let files = glob.sync(path.join(pdfDir, '*'));
    // 优先找.pdf后缀
    let pdfFile = files.find((f) => f.endsWith('.pdf'));
    if (!pdfFile && files.length > 0) {
      // 没有.pdf后缀，自动补全
      const firstFile = files[0];
      const newPdfFile = firstFile + '.pdf';
      fs.renameSync(firstFile, newPdfFile);
      pdfFile = newPdfFile;
    }

    if (pdfFile) {
      // 拼接HTTP地址
      const pdfUrl = `${this.JMCOMIC_URL}/${path.basename(pdfDir)}/${path.basename(pdfFile)}`;
      await this.botService.sendFileMessage(groupOpenid, pdfUrl, 3, {
        msg_type: 7,
        msg_id: messageId,
      });
    } else {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '未找到对应的PDF文件',
        msg_id: messageId,
      });
    }
  }
}
