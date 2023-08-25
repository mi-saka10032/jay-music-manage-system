import { WSController, Inject, OnWSConnection, OnWSDisConnection } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

@WSController('/index') // 这个命名空间好像没用
export class IndexSocketController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod(_, request: http.IncomingMessage) {
    const socketId: string = request.url;
    this.ctx.socketId = socketId;
    console.log(`socketId: ${socketId} got a connection`);
  }

  @OnWSDisConnection()
  async onDisConnectionMethod() {
    console.log(`socketId: ${this.ctx.socketId} got a disConnection`);
    this.ctx.terminate();
  }
}
