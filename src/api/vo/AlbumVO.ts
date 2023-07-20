import { BaseVO } from './BaseVO';
import { ApiProperty } from '@midwayjs/swagger';
import { SongVO } from './SongVO';
import { PageVO } from './PageVO';

export class AlbumVO extends BaseVO {
  @ApiProperty({ example: '七里香', description: '专辑名称' })
  albumName: string;

  @ApiProperty({ example: '2004-1-1', description: '发行日期' })
  publishTime: Date | null;

  @ApiProperty({ example: 'https://xxx.xxx', description: '封面图片链接' })
  coverUrl: string | null;

  @ApiProperty({ example: [new SongVO()], description: '歌曲列表' })
  songs: Array<SongVO>;
}

export class AlbumListVO extends PageVO(AlbumVO) {}
