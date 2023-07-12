import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';

/**
 * 登录DTO
 */
export class LoginDTO {
  @ApiProperty({ example: 'misaka10032', description: '用户名' })
  @Rule(RuleType.string().required().min(5).max(20))
  username: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @Rule(RuleType.string().required().min(5).max(20))
  password: string;
}
