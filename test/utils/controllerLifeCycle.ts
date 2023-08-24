import { Application, Framework } from '@midwayjs/koa';
import { close, createApp } from '@midwayjs/mock';
import { UserService } from '../../src/service/user.service';
import { User } from '../../src/entity/user';
import { SnowflakeIdGenerate } from '../../src/utils/Snowflake';
import { encrypt } from '../../src/utils/PasswordEncoder';
import { CommonController } from '../../src/controller/common.controller';

export interface ControllerContext {
  app: Application | null;
  token: string;
}

let globalUsername: string;

/**
 * @description 单元测试预处理函数-预登录与token注入-Controller专属
 * @param context 注意app与token必须以对象形式传入，个人试验如果以(app, token)单个参数传入，会构成无效拷贝，test.ts函数内部变量无法生效
 */
export async function beforeHandler(context: ControllerContext) {
  try {
    const id = new SnowflakeIdGenerate().generate();
    const username = id.toString();
    const password = id.toString();
    globalUsername = username;
    context.app = await createApp<Framework>();
    // 初始化一个账号
    const ctx = context.app.createAnonymousContext();
    ctx.userContext = { userId: id, username: username };
    const userService = await ctx.requestContext.getAsync(UserService);
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
      const o = await userService.create(user);
      console.log(o);
    }
    const commonController = await ctx.requestContext.getAsync(CommonController);
    // 获取验证码 不直接调用接口因为获取不了图片真正text 从源码可知 验证码id是 ${idPrefix}:${id}的格式 这里手动获取captchaCode
    const imageResult = await commonController.captchaService.image();
    const captchaPrefixId: string = commonController.captchaService.captcha.idPrefix;
    const captchaId: string = imageResult.id;
    const captchaCode: string = await commonController.captchaService.cacheManager.get(`${captchaPrefixId}:${captchaId}`);
    const loginVO = await commonController.login({ username, password, captchaId, captchaCode });
    // 获取一个访问凭证
    context.token = loginVO.accessToken;
  } catch (err) {
    console.error('test beforeAll error', err);
    throw err;
  }
}

/**
 * @description 单元测试后置处理函数-关闭应用-Controller专属
 * @param context 注意app必须以对象形式传入，个人试验如果以(app)单个参数传入，会构成无效拷贝，test.ts函数内部变量无法生效
 */
export async function afterHandler(context: ControllerContext) {
  // 删除beforeHandler阶段新增的账号
  const userService = await context.app.getApplicationContext().getAsync<UserService>(UserService);
  const user: User = await userService.findByUsername(globalUsername);
  if (user != null) {
    await userService.delete(user.id);
  }
  await close(context.app);
}
