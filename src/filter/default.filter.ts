import { Catch } from '@midwayjs/decorator';
import { ErrorCode } from '../music-api/code/ErrorCode';
import SystemResponse from '../music-api/code/SystemResponse';

@Catch()
export class DefaultErrorFilter {
  // 对无效token与过期token做额外判断，赋予LOGIN_ERROR的code
  TokenFilterCodes = ['UnauthorizedError', 'TokenExpiredError'];
  /**
   * 对系统抛出的异常统一处理
   */
  async catch(err: Error) {
    if (this.TokenFilterCodes.includes(err.name)) {
      const systemResponse: SystemResponse = {
        code: ErrorCode.LOGIN_ERROR,
        msg: err.message,
      };
      return systemResponse;
    }
    const systemResponse: SystemResponse = {
      code: ErrorCode.UN_ERROR,
      msg: err.message,
    };
    return systemResponse;
  }
}
