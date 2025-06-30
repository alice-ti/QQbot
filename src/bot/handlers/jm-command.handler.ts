import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotService } from '../services/bot.service';
import { CommandHandler } from '../interfaces/command-handler.interface';
import { JmcomicDownloadService } from '../../jmcomic/jmcomic-download.service';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import * as glob from 'glob';

@Injectable()
export class JmCommandHandler implements CommandHandler {
  private readonly PDF_BASE_DIR: string;
  private readonly JMCOMIC_URL: string;

  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
    private readonly jmcomicDownloadService: JmcomicDownloadService,
  ) {
    this.PDF_BASE_DIR = join(
        process.cwd(),
        '..',
        'downloads',
        'pdfs',
    );
    this.JMCOMIC_URL = this.configService.get<string>('JMCOMIC_URL');
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
    const comicId = content.replace('/JM', '').trim().match(/(\d+)/)?.[0];
    if (!comicId) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '请提供正确的漫画ID',
        msg_id: messageId,
      });
      return;
    }

    // 1. 先下载
    try {
      await this.jmcomicDownloadService.downloadComic(comicId);
    } catch (e) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '下载漫画失败: ' + e.message,
        msg_id: messageId,
      });
      return;
    }

    // 2. 查找本地PDF文件
    const pdfDir = glob.sync(join(this.PDF_BASE_DIR, comicId, '*'))[0];
    console.log("Local PDF file Path", this.PDF_BASE_DIR, pdfDir)
    if (!pdfDir) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '未找到对应的文件目录',
        msg_id: messageId,
      });
      return;
    }
    let file = glob.sync(path.join(pdfDir, '*'))[0];
    if (!file) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '未找到对应的文件',
        msg_id: messageId,
      });
      return;
    }
    if (!file.endsWith('.pdf')) {
      const newFile = file + '.pdf';
      fs.renameSync(file, newFile);
      file = newFile;
    }
    const pdfUrl = `${this.JMCOMIC_URL}/${path.basename(pdfDir)}/${path.basename(file)}`;
    await this.botService.sendFileMessage(groupOpenid, pdfUrl, 3, {
      msg_type: 7,
      msg_id: messageId,
    });
  }
}
