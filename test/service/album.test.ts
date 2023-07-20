import { Application, Framework } from '@midwayjs/koa';
import { AlbumService } from '../../src/service/album.service';
import { Album } from '../../src/entity/album';
import { AlbumVO } from '../../src/api/vo/AlbumVO';
import { close, createApp } from '@midwayjs/mock';
import { Assert } from '../../src/common/Assert';
import { ErrorCode } from '../../src/common/ErrorCode';
import { Page } from '../../src/common/Page';

describe('test/service/album.test.ts', () => {

  let app: Application;
  let service: AlbumService;
  let id: number;
  let i: Album = new Album();
  let o: AlbumVO = new AlbumVO();

  beforeAll(async () => {
    try {
      app = await createApp<Framework>();
      service = await app.getApplicationContext().getAsync<AlbumService>(AlbumService);
    } catch (err) {
      console.error('test beforeAll error', err);
      throw err;
    }
  });

  afterAll(async () => {
    await close(app);
  });

  // CRUD
  it('test service.crud ', async () => {

    // create
    const albumObj = {
      albumName: new Date().getTime().toString(),
      publishTime: new Date().toString(),
      coverUrl: 'https://xxx.xxx'
    };
    i = Object.assign(i, {
      ...albumObj,
      updaterId: 1,
      createrId: 1,
    });
    o = await service.save(i);
    id = o.id;
    Assert.notEmpty(id, ErrorCode.UN_ERROR, '创建专辑失败');

    // find
    o = await service.findById(id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询专辑失败');

    // update
    Object.assign(i, o);
    await service.save(i);
    await service.findById(id);

    // page
    const page: Page<AlbumVO> = await service.page({}, 1, 10);
    console.log('page查询', page);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // delete
    await service.delete(id);
    o = await service.findById(id);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除失败');
  });

});
