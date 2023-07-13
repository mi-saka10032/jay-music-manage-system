import { close, createApp } from '@midwayjs/mock';
import { Application, Framework } from '@midwayjs/koa';
import { Singer } from '../../src/entity/singer'
import { ErrorCode } from '../../src/common/ErrorCode'
import { SingerService } from '../../src/service/singer.service'
import { Assert } from '../../src/common/Assert';
import { Page } from '../../src/common/Page'

describe('test/service/user.test.ts', () => {

  let app: Application;
  let service: SingerService;

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
    let o = new Singer();
    o = Object.assign(o, {
      singerName,
      updaterId: 1,
      createrId: 1,
    });
    await service.save(o);
    Assert.notEmpty(o.id, ErrorCode.UN_ERROR, '创建歌手名称失败');

    // find
    o = await service.findById(o.id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询歌手名称失败');

    // update
    await service.save(o);
    o = await service.findById(o.id);

    // page
    const page: Page<Singer> = await service.page({}, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // limit
    const list: Singer[] = await service.limit({}, 0, 10);
    Assert.isTrue(list.length > 0, ErrorCode.UN_ERROR, 'LIMIT查询失败');

    // delete
    await service.delete(o.id);
    o = await service.findById(o.id);
    Assert.notNull(!o, ErrorCode.UN_ERROR, '删除失败');

  });

});
