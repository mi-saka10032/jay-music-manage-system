import { createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import { ErrorCode } from "../../src/common/ErrorCode";
import { User } from '../../src/entity/user'
import { afterHandler, beforeHandler } from '../utils/lifeCycle';

describe('test/controller/user.test.ts', () => {

  let o: User;
  const context: { app: Application | null, token: string } = {
    app: null,
    token: '',
  }

  beforeAll(beforeHandler.bind(null, context));

  afterAll(afterHandler.bind(null, context));

  // create
  it('should POST /api/user/create', async () => {
    o = new User();
    Object.assign(o, {
      username: new Date().getTime().toString(),
      password: new Date().getTime().toString(),
    });
    const result = await createHttpRequest(context.app).post('/api/user/create')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(o);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // update
  it('should POST /api/user/update', async () => {
    o.username = new Date().getTime().toString();
    const result = await createHttpRequest(context.app).post('/api/user/update')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(o);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // findById
  it('should POST /api/user/findById', async () => {
    const result = await createHttpRequest(context.app).post('/api/user/findById?id=' + o.id)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
    o = result.body.data;
  });

  // findByIds
  it('should POST /api/user/findByIds', async () => {
    const body = { ids: [o.id] }
    const result = await createHttpRequest(context.app).post('/api/user/findByIds')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // page
  it('should POST /api/user/page', async () => {
    const body = { pageNo: 1, pageSize: 10, username: o.username }
    const result = await createHttpRequest(context.app).post('/api/user/page')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // findOne
  it('should POST /api/user/findOne', async () => {
    const body = { username: o.username }
    const result = await createHttpRequest(context.app).post('/api/user/findOne')
      .set({ 'Authorization': 'Bearer ' + context.token })
      .send(body);
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });

  // delete
  it('should POST /api/user/delete', async () => {
    const result = await createHttpRequest(context.app).post('/api/user/delete?id=' + o.id)
      .set({ 'Authorization': 'Bearer ' + context.token });
    expect(result.status).toBe(200);
    expect(result.body.code).toBe(ErrorCode.OK);
  });
});
