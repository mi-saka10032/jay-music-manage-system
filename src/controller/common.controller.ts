import { Body, Config, Controller, Get, Inject, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { RedisService } from '@midwayjs/redis';
import { LoginDTO } from '../music-api/dto/LoginDTO';
import { Captcha, LoginVO } from '../music-api/vo/LoginVO';
import { SnowflakeIdGenerate } from '../utils/Snowflake';
import { JwtService } from '@midwayjs/jwt';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../music-api/code/ErrorCode';
import { UserContext } from '../common/UserContext';
import { Constant } from '../common/Constant';
import { ILogger } from '@midwayjs/core';
import { decrypt } from '../utils/PasswordEncoder';
import { Validate } from '@midwayjs/validate';
import { ApiResponse, ApiTags } from '@midwayjs/swagger';
import { CaptchaService } from '@midwayjs/captcha';

@ApiTags(['common'])
@Controller('/api')
export class CommonController {
  @Inject()
  logger: ILogger;

  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  cacheUtil: RedisService;

  @Inject()
  jwtUtil: JwtService;

  @Inject()
  idGenerate: SnowflakeIdGenerate;

  @Config('jwt')
  jwtConfig;

  @Inject()
  captchaService: CaptchaService;

  @ApiResponse({ type: LoginVO })
  @Validate()
  @Post('/login', { description: '公共网关登录' })
  async login(@Body() body: LoginDTO): Promise<LoginVO> {
    // 验证码优先校验
    const passed: boolean = await this.captchaService.check(body.captchaId, body.captchaCode);
    Assert.isTrue(passed, ErrorCode.UN_ERROR, '验证码错误');
    const user = await this.userService.findByUsername(body.username);
    // 登录空判
    Assert.notNull(user, ErrorCode.UN_ERROR, '用户不存在');
    const flag: boolean = decrypt(body.password, user.password);
    // 密码校验
    Assert.isTrue(flag, ErrorCode.UN_ERROR, '用户名或者密码错误');
    // 创建UserContext上下文类
    const { id, username } = user;
    const userContext: UserContext = new UserContext(id, username);
    // 设置token缓存
    const accessToken: string = await this.jwtUtil.sign({ ...userContext });
    const key: string = Constant.getKey(id, accessToken);
    const expiresInMinutes: number = this.jwtConfig.expiresIn;
    this.cacheUtil.set(key, JSON.stringify(userContext), 'EX', expiresInMinutes);
    // 返回登录信息与token
    const loginVO = new LoginVO();
    loginVO.username = username;
    loginVO.roles = ['admin'];
    loginVO.accessToken = accessToken;
    const expiresMillMinutes = Date.now() + expiresInMinutes * 1000;
    loginVO.expires = new Date(expiresMillMinutes);
    return loginVO;
  }

  @ApiResponse({ type: Captcha })
  @Get('/captchaGet', { description: '获取验证码' })
  async getImageCaptcha(): Promise<Captcha> {
    const { id, imageBase64 } = await this.captchaService.image({ width: 120, height: 40 });
    const captchaPrefixId: string = this.captchaService.captcha.idPrefix;
    const text = await this.captchaService.cacheManager.get(`${captchaPrefixId}:${id}`);
    console.log(text);
    return {
      id, // 验证码 id
      imageBase64, // 验证码 SVG 图片的 base64 数据，可以直接放入前端的 img 标签内
    };
  }
}
