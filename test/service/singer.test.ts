import { Singer } from '../../src/entity/singer';
import { ErrorCode } from '../../src/common/ErrorCode';
import { SingerService } from '../../src/service/singer.service';
import { Assert } from '../../src/common/Assert';
import { Page } from '../../src/common/Page';
import { SingerVO } from '../../src/api/vo/SingerVO';
import { SingerDTO } from '../../src/api/dto/SingerDTO';
import { afterHandler, beforeHandler, ServiceContext } from '../utils/serviceLifeCycle';

describe('test/service/singer.test.ts', () => {

  const context: ServiceContext<SingerService> = {
    app: null,
    service: null as SingerService
  }
  let id: number;
  let i: Singer = new Singer();
  let o: SingerVO = new SingerVO();

  beforeAll(beforeHandler.bind(null, context, SingerService));

  afterAll(afterHandler.bind(null, context));

  // CRUD
  it('test service.crud', async () => {

    // create
    const prefix = 'preSinger';
    const singerName = prefix + new Date().getTime().toString();
    i = Object.assign(i, {
      singerName,
      updaterId: 1,
      createrId: 1,
    });
    o = await context.service.create(i);
    id = o.id;
    Assert.notEmpty(id, ErrorCode.UN_ERROR, '创建歌手名称失败');

    // find
    o = await context.service.findById(id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询歌手名称失败');

    // update
    Object.assign(i, o);
    await context.service.update(i);
    await context.service.findById(id);

    // page
    const singerDTO = new SingerDTO();
    singerDTO.singerName = prefix;
    const page: Page<SingerVO> = await context.service.querySinger(singerDTO, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // delete
    await context.service.delete(id);
    o = await context.service.findById(id);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除失败');

  });

});
