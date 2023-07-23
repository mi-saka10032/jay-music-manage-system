import { ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { PageVO } from './PageVO';
import { BaseVO } from './BaseVO';
import { BaseSongVO } from './SongVO';

export class BaseSingerVO extends BaseVO {
  @ApiProperty({ type: String, description: '歌手名称' })
  singerName: string;

  @ApiProperty({ type: String, description: '封面图片链接' })
  coverUrl: string;
}

export class SingerVO extends BaseSingerVO {
  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(BaseSongVO) }, description: '歌曲列表' })
  songs: Array<BaseSongVO>;
}

export class SingerListVO extends PageVO(SingerVO) {}
