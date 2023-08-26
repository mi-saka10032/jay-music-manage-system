import { WSController, Inject, OnWSConnection, OnWSMessage, OnWSDisConnection, ILogger } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

@WSController('/index') // 这个命名空间对客户端没用
export class IndexSocketController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: ILogger;

  @OnWSConnection()
  async onConnectionMethod(_, request: http.IncomingMessage) {
    const socketId: string = request.url;
    this.ctx.socketId = socketId;
    this.logger.info(
      '[WebSocket]客户端连接成功，客户端标识：{%s}，当前在线连接数为：{%d}',
      socketId,
      this.ctx.app.clients.size
    );
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
    this.ctx.terminate();
  }
}
