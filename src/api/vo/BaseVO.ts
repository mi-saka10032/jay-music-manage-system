// 所有使用Base封装MVC的VO对象都需要继承BaseVO
import { ApiProperty } from '@midwayjs/swagger';

export class BaseVO {
  @ApiProperty({ type: Number, description: 'id' })
  id: number;
}
