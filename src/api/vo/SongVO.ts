import { BaseVO } from './BaseVO';
import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { BaseSingerVO } from './SingerVO';
import { PageVO } from './PageVO';
import { BaseAlbumVO } from './AlbumVO';

export class BaseSongVO extends BaseVO {
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
}

@ApiExtraModel(BaseSingerVO)
export class SongVO extends BaseSongVO {
  @ApiProperty({ type: () => BaseAlbumVO, description: '专辑名' })
  album: BaseAlbumVO;

  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(BaseSingerVO) }, description: '专辑名' })
  singers: Array<BaseSingerVO>;
}

export class SongListVO extends PageVO(SongVO) {}
