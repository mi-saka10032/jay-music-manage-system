import { ApiProperty } from '@midwayjs/swagger';
import { LimitDTO } from './LimitDTO';

/**
 * 登录DTO
 */
export class SingerDTO extends LimitDTO {
  @ApiProperty({ example: '周杰伦', description: '歌手名' })
  singerName: string;
}
