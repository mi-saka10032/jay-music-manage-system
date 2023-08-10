import { Body, Controller, Inject, Post, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { User } from '../entity/user';
import { BaseController } from '../common/BaseController';
import { BaseService } from '../common/BaseService';
import { RedisService } from '@midwayjs/redis';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { encrypt } from '../utils/PasswordEncoder';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { Page } from '../common/Page';
import { UserVO } from '../music-api/vo/LoginVO';

@ApiTags(['user'])
@ApiBearerAuth()
@Controller('/music-api/user')
export class UserController extends BaseController<User, UserVO> {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  cacheUtil: RedisService;

  getService(): BaseService<User, UserVO> {
    return this.userService;
  }

  @ApiResponse({ type: UserVO })
  @Post('/create', { description: '创建' })
  async create(@Body() user: User): Promise<UserVO> {
    Assert.isTrue(user.username !== null, ErrorCode.UN_ERROR, 'username不能为空');
    Assert.isTrue(user.password !== null, ErrorCode.UN_ERROR, 'password不能为空');
    Object.assign(user, {
      regTime: new Date(),
      password: encrypt(user.password),
    });
    const newUser = super.create(user);
    return Object.assign(newUser, { password: null });
  }

  @Post('/delete', { description: '删除' })
  async delete(@Query('id') id: number): Promise<boolean> {
    return super.delete(id);
  }

  @ApiResponse({ type: UserVO })
  @Post('/update', { description: '更新' })
  async update(@Body() user: User): Promise<UserVO> {
    return super.update(user);
  }

  @ApiResponse({ type: UserVO })
  @Post('/findById', { description: '通过主键查找' })
  async findById(@Query('id') id: number): Promise<UserVO> {
    return super.findById(id);
  }

  @ApiResponse({ type: UserVO })
  @Post('/findByIds', { description: '通过一批主键查找' })
  async findByIds(@Body('ids') ids: number[]): Promise<UserVO[]> {
    return super.findByIds(ids);
  }

  @ApiResponse({ type: UserVO })
  @Post('/page', { description: '分页查询' })
  async page(@Body() map: Map<string, any>): Promise<Page<UserVO>> {
    return super.page(map);
  }
}
