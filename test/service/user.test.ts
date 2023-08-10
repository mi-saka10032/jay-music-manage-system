import { User } from '../../src/entity/user';
import { ErrorCode } from '../../src/common/ErrorCode';
import { UserService } from '../../src/service/user.service';
import { encrypt } from '../../src/utils/PasswordEncoder';
import { Assert } from '../../src/common/Assert';
import { Page } from '../../src/common/Page';
import { UserVO } from '../../src/music-api/vo/LoginVO';
import { afterHandler, beforeHandler, ServiceContext } from '../utils/serviceLifeCycle';

describe('test/service/user.test.ts', () => {

  const context: ServiceContext<UserService> = {
    app: null,
    service: null as UserService
  };
  let id: number;
  let i: User = new User();
  let o: UserVO = new UserVO();
  const templateUsername = 'misaka10032';
  const templatePassword = '123456';

  beforeAll(beforeHandler.bind(null, context, UserService));

  afterAll(afterHandler.bind(null, context));

  // 为user表里新增一个用户用于调试，如果存在则结束
  it('test add one user', async () => {
    const user = await context.service.findByUsername(templateUsername);
    if (!user?.id) {
      const templateUser: User = new User();
      Object.assign(templateUser, {
        username: templateUsername,
        password: encrypt(templatePassword),
        updaterId: 1,
        createrId: 1,
        regTime: new Date(),
      });
      await context.service.create(templateUser);
    }
  });

  // CRUD
  it('test service.crud', async () => {

    // create
    const username = new Date().getTime().toString();
    i = Object.assign(i, {
      username,
      password: encrypt(new Date().getTime().toString()),
      updaterId: 1,
      createrId: 1,
      regTime: new Date(),
    });
    o = await context.service.create(i);
    id = o.id;
    Assert.notEmpty(id, ErrorCode.UN_ERROR, '创建用户失败');

    // find
    o = await context.service.findById(id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询失败');

    // update
    Object.assign(i, o);
    await context.service.update(i);
    await context.service.findById(id);

    // page
    const page: Page<UserVO> = await context.service.page({}, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // delete
    await context.service.delete(id);
    o = await context.service.findById(id);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除失败');

  });

});
