import { BaseVO } from './BaseVO';
import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { BaseSongVO } from './SongVO';
import { PageVO } from './PageVO';

export class BaseAlbumVO extends BaseVO {
  @ApiProperty({ type: String, description: '专辑名称' })
  albumName: string;

  @ApiProperty({ type: 'Date', description: '发行日期' })
  publishTime: Date | null;

  @ApiProperty({ type: 'Date', description: '封面图片链接' })
  coverUrl: string | null;
}

@ApiExtraModel(BaseSongVO)
export class AlbumVO extends BaseAlbumVO {
  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(BaseSongVO) }, description: '歌曲列表' })
  songs: Array<BaseSongVO>;
}

export class AlbumListVO extends PageVO(AlbumVO) {}
