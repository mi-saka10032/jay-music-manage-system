import { Album } from '../../src/entity/album';
import { afterHandler, beforeHandler, ControllerContext } from '../utils/controllerLifeCycle';
import { createHttpRequest } from '@midwayjs/mock';
import { ErrorCode } from '../../src/common/ErrorCode';

describe('test/controller/album.test.ts', () => {

  let o: Album;
  const context: ControllerContext = {
    app: null,
    token: '',
  };

  beforeAll(beforeHandler.bind(null, context));

  afterAll(afterHandler.bind(null, context));

  // create
  it('should POST /music-api/album/create', async () => {
    o = new Album();
    Object.assign(o, {
      albumName: new Date().getTime().toString(),
      publishTime: new Date().toString(),
      coverUrl: 'https://xxx.xxx'
    });
    const result = await createHttpRequest(context.app).post('/api/album/create')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(o);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // findById
  it('should POST /music-api/album/findById', async () => {
    const result = await createHttpRequest(context.app).post('/api/album/findById?id=' + o.id)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  })

  // update
  it('should POST /music-api/album/update', async () => {
    o.albumName = o.albumName + 'update';
    const result = await createHttpRequest(context.app).post('/api/album/update')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(o);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  })

  // page
  it('should POST /music-api/album/page', async () => {
    const body = {
      albumName: o.albumName,
      startPublishTime: new Date().getTime() - 10000,
      endPublishTime: new Date().getTime() + 10000,
      pageNo: 1,
      pageSize: 10,
    }
    const result = await createHttpRequest(context.app).post('/api/album/page')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // delete
  it('should POST /music-api/album/delete', async () => {
    const result = await createHttpRequest(context.app).post('/api/album/delete?id=' + o.id)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

});
