export interface DownloadResult {
  success: boolean;
  comic_id: string;
  download_path?: string;
  error?: string;
  message: string;
}
