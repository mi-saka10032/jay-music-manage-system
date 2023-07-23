import { ApiProperty } from '@midwayjs/swagger';
import { NewAlbumDTO } from './AlbumDTO';
import { NewSingerDTO } from './SingerDTO';
import { LimitDTO } from './LimitDTO';

export interface AudioFile {
  filename: string;
  data: string;
  fieldName: string;
  mimeType: string;
}

export class NewSongDTO {
  @ApiProperty({ type: String, description: '歌曲名称' })
  songName: string;

  @ApiProperty({ type: Number, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ type: String, description: '歌词' })
  lyric: string;

  @ApiProperty({ type: 'Date', description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ type: 'Date', description: '歌曲发行日期' })
  publishTime: Date;

  @ApiProperty({ type: NewAlbumDTO, description: '专辑名' })
  album: NewAlbumDTO;

  // 注意复杂类型要在swagger中正常显示需要在class头部引入 ApiExtraModel 关键字，并在当前属性下引入 getSchemaPath 关键字
  @ApiProperty({ type: NewSingerDTO, description: '相关歌手' })
  singer: NewSingerDTO;
}

export class AudioFormatOption extends NewSongDTO {
  isExact: boolean;
}

export class SongDTO extends LimitDTO {
  @ApiProperty({ type: String, description: '歌曲名称' })
  songName: string;

  @ApiProperty({ type: String, description: '歌词' })
  lyric: string;

  @ApiProperty({ type: 'Date', description: '歌曲发行日期范围-起始日期' })
  startPublishTime: Date;

  @ApiProperty({ type: 'Date', description: '歌曲发行日期范围-结束日期' })
  endPublishTime: Date;

  @ApiProperty({ type: String, description: '专辑名' })
  albumName: string;

  @ApiProperty({ type: String, description: '歌手名称' })
  singerName: string;
}

export class UpdateSongDTO {
  @ApiProperty({ required: true, type: Number, description: 'id' })
  id: number;

  @ApiProperty({ type: String, description: '歌曲名称' })
  songName: string;

  @ApiProperty({ type: Number, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ type: String, description: '歌词' })
  lyric: string;

  @ApiProperty({ type: String, description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ type: 'Date', description: '歌曲发行日期' })
  publishTime: Date;

  @ApiProperty({ type: Number, description: '专辑名' })
  albumId: number;

  @ApiProperty({ type: 'array', items: { type: 'number' }, description: '歌手名称' })
  singerIds: Array<number>;
}

export class Shelve_Album_SongDTO {
  @ApiProperty({ type: Number, description: '专辑id' })
  albumId: number;

  @ApiProperty({ type: Number, description: '歌曲id' })
  songId: number;

  @ApiProperty({ type: Boolean, description: '关联或取关' })
  shelve: boolean;
}

export class Shelve_Singer_SongDTO {
  @ApiProperty({ type: 'array', items: { type: 'number' }, description: '歌手ids' })
  singerIds: Array<number>;

  @ApiProperty({ type: Number, description: '歌曲id' })
  songId: number;

  @ApiProperty({ type: Boolean, description: '关联或取关' })
  shelve: boolean;
}
