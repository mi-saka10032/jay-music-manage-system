import { ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { PageVO } from './PageVO';
import { BaseVO } from './BaseVO';
import { SongVO } from './SongVO';

export class SingerVO extends BaseVO {
  @ApiProperty({ type: String, description: '歌手名称' })
  singerName: string;

  @ApiProperty({ type: String, description: '封面图片链接' })
  coverUrl: string;

  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(SongVO) }, example: [], description: '歌曲列表' })
  songs: Array<SongVO>;
}

export class SingerListVO extends PageVO(SingerVO) {}
