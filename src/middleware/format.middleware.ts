import { IMiddleware } from '@midwayjs/core';
import { Config, Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
import { ErrorCode } from '../music-api/code/ErrorCode';
import SystemResponse from '../music-api/code/SystemResponse';

/**
 * 对接口返回的数据统一包装
 */
@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('app.security')
  securityConfig;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      ctx.response.status = 200;
      const systemResponse: SystemResponse = {
        code: ErrorCode.OK,
        msg: 'OK',
      };
      if (result != null) {
        systemResponse.data = result;
      }
      return systemResponse;
    };
  }

  match(ctx) {
    const { prefix } = this.securityConfig;
    return ctx.path.indexOf(prefix) === 0;
  }

  static getName(): string {
    return 'API_RESPONSE_FORMAT';
  }
}
