// 网易云的通用返回值结构
export interface NeteaseResponse {
  code: number;
  [key: string]: any;
}

export interface AR {
  id: number;
  name: string;
}

export interface AL {
  id: number;
  name: string;
  picUrl: string;
}

// 单曲数据结构
export interface SingleSong {
  id: number;
  name: string;
  ar: Array<AR>;
  al: AL;
  publishTime: number;
}

// 查找歌曲信息的返回值结构
export interface SingleSongsResponse extends NeteaseResponse {
  result: {
    songs: Array<SingleSong>;
  };
}

// 查找歌词信息的返回值结构
export interface LyricResponse extends NeteaseResponse {
  lrc: {
    version: number;
    lyric: string;
  };
}

export interface NETEASEAPI {
  getMusicsWithKeywords: (title: string) => Promise<SingleSongsResponse>;
  getLyricWithId: (id: number) => Promise<LyricResponse>;
}
