import { ApiProperty, Type } from '@midwayjs/swagger';

/**
 * PageVO以function形式书写，是为了方便Swagger取巧识别泛型并添加备注
 */
export function PageVO<T extends Type>(list: T): any {
  class WrapperPageVO {
    @ApiProperty({ type: [list], description: '列表' })
    list: T[];

    @ApiProperty({ type: Number, example: 0, description: '总数' })
    total: number;
  }

  return WrapperPageVO;
}
