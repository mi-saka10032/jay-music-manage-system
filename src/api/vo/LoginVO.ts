import { ApiProperty } from '@midwayjs/swagger';
import { BaseVO } from './BaseVO';

/**
 * 登录成功后返回的VO
 */
export class LoginVO {
  @ApiProperty({ description: '访问凭证' })
  accessToken: string;
  @ApiProperty({ description: '有效时长（s）' })
  expiresIn: number;
}

export class UserVO extends BaseVO {
  @ApiProperty({ description: '头像' })
  avatarUrl: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '注册时间' })
  regTime: Date;

  @ApiProperty({ description: '状态 0：不可用，1：正常' })
  status: number;
}
