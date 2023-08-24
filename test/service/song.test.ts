import { afterHandler, beforeHandler, ServiceContext } from '../utils/serviceLifeCycle';
import { SongService } from '../../src/service/song.service';
import { NewSongDTO, SongDTO, UpdateSongDTO } from '../../src/music-api/dto/SongDTO';
import { SongVO } from '../../src/music-api/vo/SongVO';
import { Assert } from '../../src/common/Assert';
import { ErrorCode } from '../../src/music-api/code/ErrorCode';
import { AlbumService } from '../../src/service/album.service';
import { SingerService } from '../../src/service/singer.service';

// 注意，该单元测试不检测上传分析文件功能
describe('test/service/song.test.ts', () => {

  const context: ServiceContext<SongService> = {
    app: null,
    service: null as SongService
  };
  let songId: number;
  let albumId: number;
  let singerId: number;
  let i: NewSongDTO = new NewSongDTO();
  let u: UpdateSongDTO = new UpdateSongDTO();
  let o: SongVO = new SongVO();

  beforeAll(beforeHandler.bind(null, context, SongService));

  afterAll(afterHandler.bind(null, context));

  // CRUD
  it('test song.service.crud', async () => {

    // createSong
    i = Object.assign(i, {
      songName: new Date().getTime().toString(),
      duration: 100,
      lyric: 'this is lyric',
      musicUrl: 'httpxxx',
      publishTime: new Date(),
      album: {
        albumName: new Date().getTime().toString(),
        coverUrl: new Date().toString()
      },
      singer: {
        singerName: new Date().getTime().toString(),
        coverUrl: new Date().toString()
      }
    });
    o = await context.service.createSong(i);
    Assert.notNull(o, ErrorCode.UN_ERROR, '创建歌曲失败');
    Assert.notNull(o.id, ErrorCode.UN_ERROR, '创建歌曲失败');
    Assert.notNull(o.album.id, ErrorCode.UN_ERROR, '创建歌曲关联专辑失败');
    Assert.isTrue(o.singers.length > 0, ErrorCode.UN_ERROR, '创建歌曲关联歌手失败');
    songId = Number(o.id);
    albumId = Number(o.album.id);
    singerId = Number(o.singers[0].id);

    // update
    Object.assign(u, o);
    u.albumId = albumId;
    u.singerIds = [singerId];
    await context.service.updateSong(u);
    await context.service.findSongById(songId);

    // findSongsByAlbumId
    const a_pages = await context.service.findSongsByAlbumId(albumId, 1, 10);
    Assert.isTrue(a_pages.total > 0, ErrorCode.UN_ERROR, '分页查询关联专辑的歌曲失败');

    // findSongsBySingerId
    const s_pages = await context.service.findSongsBySingerId(singerId, 1, 10);
    Assert.isTrue(s_pages.total > 0, ErrorCode.UN_ERROR, '分页查询关联专辑的歌曲失败');

    // unshelve album&singer
    await Promise.all([
      context.service.shelveAlbum_Song(albumId, songId, false),
      context.service.shelveSinger_Song([singerId], songId, false)
    ]);

    // findSongById
    o = await context.service.findSongById(songId);
    Assert.isTrue(o.album == null, ErrorCode.UN_ERROR, '解除歌曲与专辑关联失败');
    Assert.isTrue(o.singers == null || o.singers.length === 0, ErrorCode.UN_ERROR, '解除歌曲与歌手关联失败');
    Assert.notNull(o, ErrorCode.UN_ERROR, '查询歌曲失败');

    // page
    const songDTO = new SongDTO();
    songDTO.startPublishTime = new Date(new Date().getTime() - 10000);
    songDTO.endPublishTime = new Date(new Date().getTime() + 10000);
    const page = await context.service.querySongs(songDTO, 1, 10);
    Assert.isTrue(page.total > 0, ErrorCode.UN_ERROR, '分页查询歌曲失败');

    // delete
    await context.service.delete(songId);
    o = await context.service.findSongById(songId);
    Assert.notNull(!o?.id, ErrorCode.UN_ERROR, '删除歌曲失败');

    // clear Album&Singer
    const ctx = context.app.createAnonymousContext();
    const [albumService, singerService] = await Promise.all([ctx.requestContext.getAsync(AlbumService), ctx.requestContext.getAsync(SingerService)]);
    await albumService.delete(albumId);
    await singerService.deleteSinger(singerId);
    const r1 = await albumService.findById(albumId);
    const r2 = await singerService.findById(singerId);
    Assert.notNull(!r1?.id, ErrorCode.UN_ERROR, '删除歌曲关联专辑失败');
    Assert.notNull(!r2?.id, ErrorCode.UN_ERROR, '删除歌曲关联歌手失败');

  });

});
