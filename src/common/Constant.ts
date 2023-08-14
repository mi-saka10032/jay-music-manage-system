/**
 * 常量
 */
export class Constant {
  // 登录验证时，缓存用户登录状态KEY的前缀
  static TOKEN = 'TOKEN';

  static getKey(id: number, token: string): string {
    return `${Constant.TOKEN}:${id}:${token}`;
  }
}
