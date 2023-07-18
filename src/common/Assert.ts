import { CommonException } from './CommonException';

/**
 * 断言工具类
 */
export class Assert {
  /**
   * 不为空断言
   */
  static notNull(obj: any, errorCode: number, errorMsg: string) {
    if (!obj) {
      throw new CommonException(errorCode, errorMsg);
    }
  }

  /**
   * 非数组断言
   */
  static notArray(arr: any, errorCode: number, errorMsg: string) {
    if (!Array.isArray(arr)) {
      throw new CommonException(errorCode, errorMsg);
    }
  }

  /**
   * 非普通对象断言
   */
  static notObject(obj: any, errorCode: number, errorMsg: string) {
    if (!(typeof obj === 'object')) {
      throw new CommonException(errorCode, errorMsg);
    }
  }

  /**
   * 空字符串断言
   */
  static notEmpty(obj: any, errorCode: number, errorMsg: string) {
    if (!obj || '' === obj.trim()) {
      throw new CommonException(errorCode, errorMsg);
    }
  }

  /**
   * 布尔断言
   */
  static isTrue(expression: boolean, errorCode: number, errorMsg: string) {
    if (!expression) {
      throw new CommonException(errorCode, errorMsg);
    }
  }

  /**
   * 网易云接口调用失败
   */
  static neteaseFail(errorCode: number, errorMsg: string) {
    throw new CommonException(errorCode, errorMsg);
  }
}
