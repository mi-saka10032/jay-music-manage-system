import '@midwayjs/core';
import '@midwayjs/ws';
import { UserContext } from './common/UserContext';

declare module '@midwayjs/core' {
  interface Context {
    userContext: UserContext;
  }
}

declare module '@midwayjs/ws' {
  interface Context {
    socketId: string;
  }
}
