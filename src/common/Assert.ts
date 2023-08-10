import { CommonException } from './CommonException';
import { ErrorCode } from '../music-api/code/ErrorCode';

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
   * 非日期断言
   */
  static notDate(dateString: any, errorCode: number, errorMsg: string) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new CommonException(errorCode, errorMsg);
    }
  }

  /**
   * 非数字断言
   */
  static notNumber(num: any, errorCode: number, errorMsg: string) {
    if (!(typeof num === 'number')) {
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

  // 以下是公共断言方法，提供公共错误码与错误信息
  static baseAssert_CreateObj(obj: any) {
    Assert.notNull(obj, ErrorCode.UN_ERROR, '新建对象不能为空');
  }

  static baseAssert_CreateId(id: number) {
    Assert.notNull(!id, ErrorCode.UN_ERROR, '新建对象时，ID必须为空');
  }

  static baseAssert_DeleteId(id: number) {
    Assert.notNull(id, ErrorCode.UN_ERROR, '删除对象时，ID不能为空');
  }

  static baseAssert_UpdateObj(obj: any) {
    Assert.notNull(obj, ErrorCode.UN_ERROR, '更新对象不能为空');
  }

  static baseAssert_UpdateId(id: number) {
    Assert.notNull(id, ErrorCode.UN_ERROR, '更新对象时，ID不能为空');
  }

  static baseAssert_FindId(id: number) {
    Assert.notNull(id, ErrorCode.UN_ERROR, '查询对象时，ID不能为空');
  }

  static baseAssert_FindIds(ids: Array<number>) {
    Assert.notNull(ids, ErrorCode.UN_ERROR, '查询对象时，IDS不能为空');
  }

  static baseAssert_QueryPage(obj: any) {
    Assert.notNull(obj, ErrorCode.UN_ERROR, '分页查询时，查询参数不能为空');
  }

  static baseAssert_QueryOne(obj: any) {
    Assert.notNull(obj, ErrorCode.UN_ERROR, '单个对象查询时，查询参数不能为空');
  }
}
