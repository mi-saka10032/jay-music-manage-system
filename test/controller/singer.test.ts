import { createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import { ErrorCode } from '../../src/common/ErrorCode';
import { Singer } from '../../src/entity/singer';
import { afterHandler, beforeHandler } from '../utils/lifeCycle';

describe('test/controller/user.test.ts', () => {

  let o: Singer;
  const context: { app: Application | null, token: string } = {
    app: null,
    token: '',
  }

  beforeAll(beforeHandler.bind(null, context, 'singer'));

  afterAll(afterHandler.bind(null, context));

  // create
  it('should POST /api/singer/create', async () => {
    o = new Singer();
    Object.assign(o, {
      singerName: new Date().getTime().toString(),
    });
    const result = await createHttpRequest(context.app).post('/api/singer/create')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(o);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // findById
  it('should POST /api/singer/findById', async () => {
    const result = await createHttpRequest(context.app).post('/api/singer/findById?id=' + o.id)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // page
  it('should POST /api/singer/page', async () => {
    const body = { pageNo: 1, pageSize: 10, singerName: o.singerName }
    const result = await createHttpRequest(context.app).post('/api/singer/page')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });


  // delete
  it('should POST /api/singer/delete', async () => {
    const result = await createHttpRequest(context.app).post('/api/singer/delete?id=' + o.id)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });
});
