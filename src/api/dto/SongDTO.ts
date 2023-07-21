import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { NewAlbumDTO } from './AlbumDTO';
import { NewSingerDTO } from './SingerDTO';

export interface AudioFile {
  filename: string;
  data: string;
  fieldName: string;
  mimeType: string;
}

@ApiExtraModel(NewSingerDTO)
export class NewSongDTO {
  @ApiProperty({ example: '七里香', description: '歌曲名称' })
  songName: string;

  @ApiProperty({ example: 100, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ example: '[0:0:0] 第一句歌词', description: '歌词' })
  lyric: string;

  @ApiProperty({ example: 'https://xxx.xxx', description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ type: NewAlbumDTO, description: '专辑名' })
  album: NewAlbumDTO;

  @ApiProperty({ example: '2004-8-8', description: '歌曲发行日期' })
  publishTime: Date;

  // 注意复杂类型要在swagger中正常显示需要在class头部引入 ApiExtraModel 关键字，并在当前属性下引入 getSchemaPath 关键字
  @ApiProperty({ type: 'array', items: { $ref: getSchemaPath(NewSingerDTO) }, description: '相关歌手' })
  singers: Array<NewSingerDTO>;
}

export class AudioFormatOption extends NewSongDTO {
  isExact: boolean;
}
