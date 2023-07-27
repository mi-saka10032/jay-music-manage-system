import { Application, Framework } from '@midwayjs/koa';
import { close, createApp } from '@midwayjs/mock';

/**
 * @description 单元测试预处理函数-预注入userContext并通过Service泛型完成应用注册封装-Service专属
 * @param context 注意app与service必须以对象形式传入，个人试验如果以单个参数传入，会构成无效拷贝，test.ts函数内部变量无法生效
 */
export interface ServiceContext<T> {
  app: Application;
  service: T;
}

export async function beforeHandler<T extends new (...args: any[]) => any>(context: ServiceContext<T>, service: T) {
  try {
    context.app = await createApp<Framework>();
    const ctx = context.app.createAnonymousContext();
    // 模拟注入登录用户信息context
    ctx.userContext = { userId: 1, username: 'test' };
    context.service = await ctx.requestContext.getAsync(service);
  } catch (err) {
    console.error('test beforeAll error', err);
    throw err;
  }
}

/**
 * @description 单元测试后置处理函数-关闭应用-Service专属
 * @param context 注意app必须以对象形式传入，个人试验如果以(app)单个参数传入，会构成无效拷贝，test.ts函数内部变量无法生效
 */
export async function afterHandler<T extends new (...args: any[]) => any>(context: ServiceContext<T>) {
  await close(context.app);
}
