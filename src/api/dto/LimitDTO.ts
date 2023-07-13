import { ApiProperty } from '@midwayjs/swagger';

/**
 * 分页查询入参DTO
 */
export class LimitDTO {
  @ApiProperty({ example: 1, description: '当前页' })
  pageNo = 1;

  @ApiProperty({ example: 10, description: '分页数' })
  pageSize = 10;
}
