import { ApiProperty } from '@midwayjs/swagger';
import { PageVO } from './PageVO';
import { BaseVO } from '../../common/BaseEntity';

export class SingerVO extends BaseVO {
  @ApiProperty({ type: Number, description: 'id' })
  id: number;

  @ApiProperty({ type: String, description: '歌手名称' })
  singerName: string;
}

export class SingerListVO extends PageVO(SingerVO) {}
