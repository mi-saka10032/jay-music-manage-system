import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { User } from '../entity/user';
import { Repository } from 'typeorm';
import { BaseService } from '../common/BaseService';
import { Context } from '@midwayjs/koa';

@Provide()
export class UserService extends BaseService<User> {
  @InjectEntityModel(User)
  model: Repository<User>;

  getModel(): Repository<User> {
    return this.model;
  }

  @Inject()
  ctx: Context;

  async findByUsername(username: string): Promise<User> {
    return this.model.findOne({ where: { username } });
  }

  injectUserid(source: object): void {
    const userId: number = this.ctx.userContext.userId;
    Object.assign(source, {
      createrId: userId,
      updaterId: userId,
    });
  }
}
