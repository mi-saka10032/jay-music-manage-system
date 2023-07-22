import { ApiProperty } from '@midwayjs/swagger';
import { LimitDTO } from './LimitDTO';

export class NewSingerDTO {
  @ApiProperty({ example: '周杰伦', description: '歌手名' })
  singerName: string;

  @ApiProperty({ type: String, description: '歌手照片封面' })
  coverUrl: string;
}

export class SingerDTO extends LimitDTO {
  @ApiProperty({ example: '周杰伦', description: '歌手名' })
  singerName: string;
}
