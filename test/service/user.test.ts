import { close, createApp } from '@midwayjs/mock';
import { Application, Framework } from '@midwayjs/koa';
import { User } from '../../src/entity/user';
import { ErrorCode } from '../../src/common/ErrorCode';
import { UserService } from '../../src/service/user.service';
import { encrypt } from '../../src/utils/PasswordEncoder';
import { Assert } from '../../src/common/Assert';
import { Page } from '../../src/common/Page';
import { UserVO } from '../../src/api/vo/LoginVO';

describe('test/service/user.test.ts', () => {

  let app: Application;
  let service: UserService;
  let id: number;
  let i: User = new User();
  let o: UserVO = new UserVO();

  beforeAll(async () => {
    try {
      app = await createApp<Framework>();
      service = await app.getApplicationContext().getAsync<UserService>(UserService);
    } catch (err) {
      console.error('test beforeAll error', err);
      throw err;
    }
  });

  afterAll(async () => {
    await close(app);
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
    o = await service.save(i);
    id = o.id;
    Assert.notEmpty(id, ErrorCode.UN_ERROR, '创建用户失败');

    // find
    o = await service.findById(id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询失败');

    // update
    Object.assign(i, o);
    await service.save(i);
    await service.findById(id);

    // page
    const page: Page<UserVO> = await service.page({}, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // delete
    await service.delete(id);
    o = await service.findById(id);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除失败');

  });

});
