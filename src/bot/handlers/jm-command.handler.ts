import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotService } from '../services/bot.service';
import { CommandHandler } from '../interfaces/command-handler.interface';
import { JmcomicDownloadService } from '../../jmcomic/jmcomic-download.service';
import * as fs from 'fs';
import { join, basename, dirname } from 'path';
import * as glob from 'glob';

@Injectable()
export class JmCommandHandler implements CommandHandler {
  private readonly PDF_BASE_DIR: string;
  private readonly IMAGE_BASE_DIR: string;
  private readonly JMCOMIC_URL: string;

  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
    private readonly jmcomicDownloadService: JmcomicDownloadService,
  ) {
    this.PDF_BASE_DIR = join(process.cwd(), '..', 'downloads', 'pdfs');
    this.IMAGE_BASE_DIR = join(process.cwd(), '..', 'downloads', 'images');
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

    const getFileFn = this.getImageFilePath.bind(this);

    const fileUrl = await getFileFn(comicId, groupOpenid, messageId);
    console.log('File URL', fileUrl);

    if (!fileUrl) return;

    await this.botService.sendFileMessage(groupOpenid, fileUrl, 1, {
      msg_type: 7,
      msg_id: messageId,
    });
  }

  // 查找本地PDF文件
  async getPDFfilePath(
    comicId: string,
    groupOpenid: string,
    messageId: string,
  ): Promise<string> {
    let file = glob.sync(join(this.PDF_BASE_DIR, comicId, '*'))[0];
    console.log('Local PDF file Path', file);
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

    const pdfUrl = `${this.JMCOMIC_URL}/pdfs/${comicId}/${basename(file)}`;
    return pdfUrl;
  }

  // 查找本地图片文件
  async getImageFilePath(
    comicId: string,
    groupOpenid: string,
    messageId: string,
  ): Promise<string> {
    const files = glob.sync(
      join(this.IMAGE_BASE_DIR, comicId, '*', '*.{jpg,jpeg,png,gif,webp,svg}'),
    );

    let test_file = files[0];
    if (!test_file) {
      await this.botService.sendMessage(groupOpenid, {
        msg_type: 0,
        content: '未找到对应的图片文件',
        msg_id: messageId,
      });
      return;
    }

    console.log('Local Image files', files);
    const folderName = basename(dirname(test_file));
    const imageUrl = `${this.JMCOMIC_URL}/images/${comicId}/${folderName}/${basename(test_file)}`;
    console.log('Image URL', imageUrl);
    return imageUrl;
  }
}
