import { Application, Framework } from '@midwayjs/koa';
import { close, createApp } from '@midwayjs/mock';
import { UserService } from '../../src/service/user.service';
import { User } from '../../src/entity/user';
import { encrypt } from '../../src/utils/PasswordEncoder';
import { CommonController } from '../../src/controller/common.controller';

// jest登录锁
let jestLoginLock = false;

/**
 * @description 单元测试预处理函数-预登录与token注入
 * @param context 注意app与token必须以对象形式传入，个人试验如果以(app, token)单个参数传入，会构成无效拷贝，test.ts函数内部变量无法生效
 */
export async function beforeHandler(context: { app: Application, token: string }) {
  const username = 'zhangsan';
  const password = '123456';
  try {
    context.app = await createApp<Framework>();
    // 初始化一个账号
    const userService = await context.app.getApplicationContext().getAsync<UserService>(UserService);
    let user: User = await userService.findByUsername(username);
    if (user == null) {
      user = new User();
      user = Object.assign(user, {
        username,
        password: encrypt(password),
        updaterId: 1,
        createrId: 1,
        regTime: new Date(),
      });
      const o = await userService.save(user);
      console.log(o);
    }
    // 获取一个访问凭证
    const commonController = await context.app.getApplicationContext().getAsync<CommonController>(CommonController);
    if (!jestLoginLock) {
      jestLoginLock = true;
      const loginVO = await commonController.login({ username, password });
      context.token = loginVO.accessToken;
      jestLoginLock = false;
    }
  } catch (err) {
    console.error('test beforeAll error', err);
    throw err;
  }
}

/**
 * @description 单元测试后置处理函数-关闭应用
 * @param context 注意app必须以对象形式传入，个人试验如果以(app)单个参数传入，会构成无效拷贝，test.ts函数内部变量无法生效
 */
export async function afterHandler(context: { app: Application, token: string }) {
  await close(context.app);
}
