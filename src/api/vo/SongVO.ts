import { BaseVO } from './BaseVO';
import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { SingerVO } from './SingerVO';
import { PageVO } from './PageVO';
import { AlbumVO } from './AlbumVO';

@ApiExtraModel(SingerVO)
export class SongVO extends BaseVO {
  @ApiProperty({ type: String, description: '歌曲名称' })
  songName: string;

  @ApiProperty({ type: Number, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ type: String, description: '歌词' })
  lyric: string;

  @ApiProperty({ type: String, description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ type: Date, description: '发行日期' })
  publishTime: Date;

  @ApiProperty({ type: () => AlbumVO, description: '专辑名' })
  album: AlbumVO;

  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(SingerVO) }, description: '专辑名' })
  singers: Array<SingerVO>;
}

export class SongListVO extends PageVO(SongVO) {}
