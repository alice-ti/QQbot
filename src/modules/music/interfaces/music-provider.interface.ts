export interface SongInfo {
  title: string;
  singer: string;
  jumpUrl: string;
  imageUrl: string;
  source: string;
  mid: string;
}

export interface MusicProvider {
  search(keyword: string): Promise<SongInfo[]>;
}
