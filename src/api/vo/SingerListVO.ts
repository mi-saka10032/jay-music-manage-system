import { Page } from '../../common/Page';
import { ApiProperty, Type } from '@midwayjs/swagger';
import { Singer } from '../../entity/singer';

function wrapperSingerList<T extends Type>(list: T): any {
  class Wrapper extends Page<T> {
    @ApiProperty({ type: [list], description: '歌手列表' })
    list: T[];

    @ApiProperty({ type: Number, description: '总数' })
    total: number;
  }

  return Wrapper;
}

export class SingerListVO extends wrapperSingerList(Singer) {}
