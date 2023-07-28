import { AlbumService } from '../../src/service/album.service';
import { Album } from '../../src/entity/album';
import { AlbumVO } from '../../src/api/vo/AlbumVO';
import { Assert } from '../../src/common/Assert';
import { ErrorCode } from '../../src/common/ErrorCode';
import { Page } from '../../src/common/Page';
import { AlbumDTO } from '../../src/api/dto/AlbumDTO';
import { afterHandler, beforeHandler, ServiceContext } from '../utils/serviceLifeCycle';

describe('test/service/album.test.ts', () => {

  const context: ServiceContext<AlbumService> = {
    app: null,
    service: null as AlbumService
  };
  let id: number;
  let i: Album = new Album();
  let o: AlbumVO = new AlbumVO();

  beforeAll(beforeHandler.bind(null, context, AlbumService));

  afterAll(afterHandler.bind(null, context));

  // CRUD
  it('test service.crud ', async () => {

    // create
    const albumObj = {
      albumName: new Date().getTime().toString(),
      publishTime: new Date(),
      coverUrl: 'https://xxx.xxx'
    };
    i = Object.assign(i, {
      ...albumObj,
      updaterId: 1,
      createrId: 1,
    });
    o = await context.service.create(i);
    id = o.id;
    Assert.notEmpty(id, ErrorCode.UN_ERROR, '创建专辑失败');

    // find
    o = await context.service.findAlbumById(id);
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询专辑失败');

    // update
    Object.assign(i, o);
    await context.service.update(i);
    await context.service.findById(id);

    // page
    const albumDTO = new AlbumDTO();
    albumDTO.startPublishTime = new Date(Date.now() - 10000);
    albumDTO.endPublishTime = new Date(Date.now() + 10000);
    const page: Page<AlbumVO> = await context.service.queryAlbums(albumDTO, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询失败');

    // delete
    await context.service.deleteAlbum(id);
    o = await context.service.findAlbumById(id);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除失败');
  });

});
