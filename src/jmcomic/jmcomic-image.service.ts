import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { join, extname, normalize } from 'path';
import { existsSync, statSync } from 'fs';

export interface ImageFileInfo {
  filePath: string;
  contentType: string;
  fileName: string;
}

@Injectable()
export class JmcomicImageService {
  private readonly logger = new Logger(JmcomicImageService.name);
  private readonly imageDownloadPath = join(
    process.cwd(),
    '..',
    'downloads',
    'images',
  );
  private readonly pdfDownloadPath = join(
    process.cwd(),
    '..',
    'downloads',
    'pdfs',
  );
  private readonly imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
  ];
  private readonly pdfExtensions = ['.pdf'];

  // 获取图片文件
  async getImageFile(filePath: string): Promise<ImageFileInfo> {
    return this.getFile(filePath, 'image');
  }

  // 获取PDF文件
  async getPdfFile(filePath: string): Promise<ImageFileInfo> {
    return this.getFile(filePath, 'pdf');
  }

  constructor() {
    console.log(`Image download path: ${this.imageDownloadPath}`);
    console.log(`PDF download path: ${this.pdfDownloadPath}`);
  }

  private async getFile(
    filePath: string,
    fileType: 'image' | 'pdf',
  ): Promise<ImageFileInfo> {
    try {
      const downloadPath =
        fileType === 'image' ? this.imageDownloadPath : this.pdfDownloadPath;
      const allowedExtensions =
        fileType === 'image' ? this.imageExtensions : this.pdfExtensions;

      // 验证文件路径
      if (!this.isValidFilePath(filePath, allowedExtensions)) {
        throw new BadRequestException('无效的文件路径');
      }

      // 构建完整文件路径
      const fullPath = join(downloadPath, filePath);
      const normalizedPath = normalize(fullPath);

      // 确保文件路径在允许的目录内（防止路径遍历攻击）
      if (!normalizedPath.startsWith(normalize(downloadPath))) {
        throw new BadRequestException('无效的文件路径');
      }

      // 检查文件是否存在
      if (!existsSync(normalizedPath)) {
        throw new NotFoundException('图片不存在');
      }

      // 检查是否为文件
      const stats = statSync(normalizedPath);
      if (!stats.isFile()) {
        throw new BadRequestException('请求的不是文件');
      }

      // 获取文件信息
      const ext = extname(filePath).toLowerCase();
      const contentType = this.getContentType(ext);

      return {
        filePath: normalizedPath,
        contentType,
        fileName: filePath,
      };
    } catch (error) {
      this.logger.error(`获取图片失败: \${filePath}`, error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new NotFoundException('图片不存在');
    }
  }

  // 验证文件路径是否有效
  private isValidFilePath(
    filePath: string,
    allowedExtensions: string[],
  ): boolean {
    if (!filePath || filePath.trim() === '') {
      return false;
    }

    // 检查文件扩展名
    const ext = extname(filePath).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return false;
    }

    // 检查是否包含危险字符
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(filePath)) {
      return false;
    }

    // 检查路径遍历攻击 - 不允许 .. 但允许正常的目录分隔符
    if (filePath.includes('..')) {
      return false;
    }

    // 规范化路径分隔符，统一使用正斜杠
    const normalizedPath = filePath.replace(/\\/g, '/');

    // 检查路径段是否有效
    const pathSegments = normalizedPath.split('/');
    for (const segment of pathSegments) {
      if (segment === '' || segment === '.' || segment === '..') {
        return false;
      }

      // 检查每个路径段是否包含危险字符
      if (dangerousChars.test(segment)) {
        return false;
      }
    }

    return true;
  }

  // 根据文件扩展名获取 MIME 类型
  private getContentType(ext: string): string {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
