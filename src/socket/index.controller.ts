import { WSController, Inject, OnWSConnection, OnWSMessage, OnWSDisConnection, ILogger } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';
import * as http from 'http';
// eslint-disable-next-line node/no-extraneous-import
import Redis from 'ioredis';
import { Constant } from '../common/Constant';
import { SocketSongResponse } from '../music-api/code/SocketSongEnum';

@WSController('/index') // 这个命名空间对浏览器客户端没用
export class IndexSocketController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: ILogger;

  // 为Context创建订阅者Redis实例
  redis: Redis;

  @OnWSConnection()
  async onConnectionMethod(_, request: http.IncomingMessage) {
    const socketId: string = request.url;
    this.ctx.socketId = socketId;
    this.logger.info(
      '[WebSocket]客户端连接成功，客户端标识：{%s}，当前在线连接数为：{%d}',
      socketId,
      this.ctx.app.clients.size
    );
    this.redis = new Redis();
    // redis订阅
    await this.redis.subscribe(Constant.REDIS_CHANNEL);
    this.redis.on('message', (channel, message) => {
      try {
        // 订阅来自http服务器的消息，匹配socketId，发送歌曲进度数据
        const result: { id: string; data: SocketSongResponse } = JSON.parse(message);
        if (this.ctx.socketId === result.id) {
          this.ctx.send(JSON.stringify(result.data));
        }
      } catch (error: any) {
        console.log(error);
      }
    });
  }

  @OnWSMessage('message')
  async onMessageMethod(data: string) {
    const socketId = this.ctx.socketId;
    this.logger.info('[WebSocket]收到客户端{%s}的消息：{%s}', socketId, data);
    // 心跳检测响应
    if (data.toString() === 'ping') {
      this.logger.info('[WebSocket]服务端 已回复客户端{%s} 的心跳检测: pong', socketId);
      return 'pong';
    }
  }

  @OnWSDisConnection()
  async onDisConnectionMethod() {
    this.logger.info('[WebSocket]客户端已断开，客户端标识：{%s}', this.ctx.socketId);
    // redis取消订阅
    await this.redis.unsubscribe();
    this.ctx.terminate();
  }
}
