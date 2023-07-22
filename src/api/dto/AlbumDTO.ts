import { ApiProperty } from '@midwayjs/swagger';
import { LimitDTO } from './LimitDTO';

export class NewAlbumDTO {
  @ApiProperty({ type: String, description: '专辑名称' })
  albumName: string;

  @ApiProperty({ type: Date, description: '发行日期' })
  publishTime: Date;

  @ApiProperty({ example: 'string', description: '封面图片链接' })
  coverUrl: string;
}

export class AlbumDTO extends LimitDTO {
  @ApiProperty({ type: String, description: '专辑名称' })
  albumName: string;

  @ApiProperty({ type: Date, description: '发行日期范围-起始日期' })
  startPublishTime: Date;

  @ApiProperty({ type: Date, description: '发行日期范围-结束日期' })
  endPublishTime: Date;

  @ApiProperty({ type: String, description: '封面图片链接' })
  coverUrl: string;
}
