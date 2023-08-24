import { afterHandler, beforeHandler, ControllerContext } from '../utils/controllerLifeCycle';
import { NewSongDTO, UpdateSongDTO } from '../../src/music-api/dto/SongDTO';
import { createHttpRequest } from '@midwayjs/mock';
import { ErrorCode } from '../../src/music-api/code/ErrorCode';
import { SongVO } from '../../src/music-api/vo/SongVO';

describe('test/controller/song.test.ts', () => {

  let i: NewSongDTO;
  let songId: number;
  let albumId: number;
  let singerId: number;
  let u: UpdateSongDTO;
  let o: SongVO;
  const context: ControllerContext = {
    app: null,
    token: ''
  };

  beforeAll(beforeHandler.bind(null, context));

  afterAll(afterHandler.bind(null, context));

  // create
  it('should POST /api/song/create', async () => {
    i = new NewSongDTO();
    Object.assign(i, {
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
    const result = await createHttpRequest(context.app).post('/api/song/create')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(i);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    expect(result.body.data.album.id).toBeTruthy();
    expect(result.body.data.singers).toBeTruthy();
    expect(result.body.data.singers[0].id).toBeTruthy();
    o = result.body.data;
    songId = o.id;
    albumId = o.album.id;
    singerId = o.singers[0].id;
  });

  // findById
  it('should POST /api/song/findById', async () => {
    const result = await createHttpRequest(context.app).post('/api/song/findById?id=' + songId)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // update
  it('should POST /api/song/update', async () => {
    u = new UpdateSongDTO();
    Object.assign(u, o);
    u.albumId = albumId;
    u.singerIds = [singerId];
    const result = await createHttpRequest(context.app).post('/api/song/update')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(u);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // pageByAlbumId
  it('should POST /api/song/pageByAlbumId', async () => {
    const body = {
      albumId,
      pageNo: 1,
      pageSize: 10
    };
    const result = await createHttpRequest(context.app).post('/api/song/pageByAlbumId')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // pageSingerId
  it('should POST /api/song/pageSingerId', async () => {
    const body = {
      singerId,
      pageNo: 1,
      pageSize: 10
    };
    const result = await createHttpRequest(context.app).post('/api/song/pageSingerId')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // page
  it('should POST /api/song/page', async () => {
    const body = {
      songName: o.songName,
      startPublishTime: new Date().getTime() - 10000,
      endPublishTime: new Date().getTime() + 10000,
      pageNo: 1,
      pageSize: 10,
    };
    const result = await createHttpRequest(context.app).post('/api/song/page')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // unshelve album
  it('should POST /api/song/shelveAlbumId', async () => {
    const body = { albumId, songId, shelve: false };
    const result = await createHttpRequest(context.app).post('/api/song/shelveAlbumId')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // unshelve singer
  it('should POST /api/song/shelveSingerId', async () => {
    const body = { singerIds: [singerId], songId, shelve: false };
    const result = await createHttpRequest(context.app).post('/api/song/shelveSingerId')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // delete
  it('should POST /api/song/delete', async () => {
    const result = await createHttpRequest(context.app).post('/api/song/delete?id=' + songId)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // deleteAlbum
  it('should POST /api/album/delete', async () => {
    const result = await createHttpRequest(context.app).post('/api/album/delete?id=' + albumId)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  })

  // deleteSinger
  it('should POST /api/singer/delete', async () => {
    const result = await createHttpRequest(context.app).post('/api/singer/delete?id=' + singerId)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  })

});
