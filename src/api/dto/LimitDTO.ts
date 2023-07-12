import { ApiProperty } from '@midwayjs/swagger';

export class LimitDTO {
  @ApiProperty({ example: 1, description: '当前页' })
  pageNo: number = 1;

  @ApiProperty({ example: 10, description: '分页数' })
  pageSize: number = 10;
}
