import { ApiProperty } from '@midwayjs/swagger';
import { LimitDTO } from './LimitDTO';

export class NewSingerDTO {
  @ApiProperty({ example: '周杰伦', description: '歌手名' })
  singerName: string;
}

export class SingerDTO extends LimitDTO {
  @ApiProperty({ example: '周杰伦', description: '歌手名' })
  singerName: string;
}
