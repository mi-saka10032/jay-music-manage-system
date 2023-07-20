import { ApiProperty } from '@midwayjs/swagger';
import { LimitDTO } from './LimitDTO';

export class NewAlbumDTO {
  @ApiProperty({ example: '魔杰座', description: '专辑名称' })
  albumName: string;

  @ApiProperty({ example: '2004-1-1', description: '发行日期' })
  publishTime?: Date;

  @ApiProperty({ example: 'string', description: '封面图片链接' })
  coverUrl?: string;
}

export class AlbumDTO {
  @ApiProperty({ example: '魔杰座', description: '专辑名称' })
  albumName: string;

  @ApiProperty({ example: '2001-1-1', description: '发行日期范围-起始日期' })
  startPublishTime: Date;

  @ApiProperty({ example: '2007-1-1', description: '发行日期范围-结束日期' })
  endPublishTime: Date;

  @ApiProperty({ example: 'string', description: '封面图片链接' })
  coverUrl: string;
}

export class AlbumListDTO extends LimitDTO {}
