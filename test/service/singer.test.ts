import { close, createApp } from '@midwayjs/mock';
import { Application, Framework } from '@midwayjs/koa';
import { Singer } from '../../src/entity/singer';
import { ErrorCode } from '../../src/common/ErrorCode';
import { SingerService } from '../../src/service/singer.service';
import { Assert } from '../../src/common/Assert';
import { Page } from '../../src/common/Page';
import { SingerVO } from '../../src/api/vo/SingerVO';

describe('test/service/user.test.ts', () => {

  let app: Application;
  let service: SingerService;
  let id: number;
  let i: Singer = new Singer();
  let o: SingerVO = new SingerVO();

  beforeAll(async () => {
    try {
      app = await createApp<Framework>();
      service = await app.getApplicationContext().getAsync<SingerService>(SingerService);
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
    const singerName = new Date().getTime().toString();
    i = Object.assign(i, {
      singerName,
      updaterId: 1,
      createrId: 1,
    });
    o = await service.save(i);
    id = o.id;
    Assert.notEmpty(id, ErrorCode.UN_ERROR, '创建歌手名称失败');

    // find
    o = await service.findById(id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询歌手名称失败');

    // update
    Object.assign(i, o);
    await service.save(i);
    await service.findById(id);

    // page
    const page: Page<SingerVO> = await service.page({}, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // delete
    await service.delete(id);
    o = await service.findById(id);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除失败');

  });

});
