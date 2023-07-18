import { ApiProperty } from '@midwayjs/swagger';
import { PageVO } from './PageVO';
import { BaseVO } from './BaseVO';

export class SingerVO extends BaseVO {
  @ApiProperty({ type: String, description: '歌手名称' })
  singerName: string;
}

export class SingerListVO extends PageVO(SingerVO) {}
