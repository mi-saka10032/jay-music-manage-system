/**
 * 常量
 */
export class Constant {
  // 登录验证时，缓存用户登录状态KEY的前缀
  static TOKEN = 'TOKEN';

  static REDIS_CHANNEL = 'music-channel';

  static getKey(id: number, token: string): string {
    return `${Constant.TOKEN}:${id}:${token}`;
  }

  static getSocketId(): string {
    return 'socketId';
  }
}
