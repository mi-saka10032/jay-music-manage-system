import { ApiProperty } from '@midwayjs/swagger';

export interface AudioFile {
  filename: string;
  data: string;
  fieldName: string;
  mimeType: string;
}

export class NewSongDTO {
  @ApiProperty({ example: '七里香', description: '歌曲名称' })
  songName: string;

  @ApiProperty({ example: 100, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ example: '[0:0:0] 第一句歌词', description: '歌词' })
  lyric: string;

  @ApiProperty({ example: 'https://xxx.xxx', description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ example: '七里香', description: '专辑名' })
  album: string;

  @ApiProperty({ example: '2004-8-8', description: '歌曲发行日期' })
  publishTime: Date;

  @ApiProperty({ example: '["周杰伦"]', description: '相关歌手' })
  singers: Array<string>;
}

export class AudioFormatOption extends NewSongDTO {
  isExact: boolean;
}
