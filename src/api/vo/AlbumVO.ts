import { BaseVO } from './BaseVO';
import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { SongVO } from './SongVO';
import { PageVO } from './PageVO';

@ApiExtraModel(SongVO)
export class AlbumVO extends BaseVO {
  @ApiProperty({ type: String, description: '专辑名称' })
  albumName: string;

  @ApiProperty({ type: Date, description: '发行日期' })
  publishTime: Date | null;

  @ApiProperty({ type: String, description: '封面图片链接' })
  coverUrl: string | null;

  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(SongVO) }, description: '歌曲列表' })
  songs: Array<SongVO>;
}

export class AlbumListVO extends PageVO(AlbumVO) {}
