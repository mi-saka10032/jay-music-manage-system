import { Configuration, App, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { FormatMiddleware } from './middleware/format.middleware';
import * as redis from '@midwayjs/redis';
import * as swagger from '@midwayjs/swagger';
import * as jwt from '@midwayjs/jwt';
import * as crossDomain from '@midwayjs/cross-domain';
import { SecurityMiddleware } from './middleware/security.middleware';
import * as dotenv from 'dotenv';
import { ILogger, MidwayDecoratorService } from '@midwayjs/core';
import * as upload from '@midwayjs/upload';
import * as oss from '@midwayjs/oss';
import { PAGE_NO_KEY, PAGE_SIZE_KEY } from './decorator/page.decorator';
import * as captcha from '@midwayjs/captcha';
import * as ws from '@midwayjs/ws';

// 初始化环境变量
dotenv.config();

@Configuration({
  imports: [
    crossDomain, // 支持跨域
    jwt, // 用于访问凭证签发时进行JWT编码
    swagger, // API接口工具
    redis, // 缓存
    orm, // 数据库操作
    koa,
    ws,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    upload,
    oss,
    captcha,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  @Inject()
  logger: ILogger;

  @Inject()
  decoratorService: MidwayDecoratorService;

  async onReady() {
    this.app.useMiddleware([SecurityMiddleware, FormatMiddleware, ReportMiddleware]);
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    // 实现参数装饰器
    this.decoratorService.registerParameterHandler(PAGE_NO_KEY, options => {
      const pageNo = options.originArgs[options.parameterIndex];
      if (typeof pageNo !== 'number' || Number(pageNo) < 1) {
        return 1;
      } else return pageNo;
    });
    this.decoratorService.registerParameterHandler(PAGE_SIZE_KEY, options => {
      const pageSize = options.originArgs[options.parameterIndex];
      if (typeof pageSize !== 'number' || Number(pageSize) < 1) {
        return 10;
      } else if (Number(pageSize) > 1000) {
        return 1000;
      } else return pageSize;
    });
  }
}
