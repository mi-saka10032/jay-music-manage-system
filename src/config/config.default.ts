import { MidwayConfig } from '@midwayjs/core';
import { uploadWhiteList } from '@midwayjs/upload';
import * as redisStore from 'cache-manager-ioredis';
import { join } from 'path';
import { tmpdir } from 'os';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1656642815846_4983',
  app: {
    security: {
      prefix: '/api',
      ignore: ['/api/login', '/api/captchaGet'],
    },
  },
  koa: {
    port: 7001,
  },
  // ORM和数据库配置
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: 'jay_music_manage_system',
        synchronize: false, // 如果第一次使用，不存在表，有同步的需求可以写 true
        logging: true,
        entities: ['**/entity/*{.ts,.js}'],
      },
    },
  },
  // redis配置
  redis: {
    client: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: 0,
    },
  },
  // jwt配置
  jwt: {
    secret: 'setscrew',
    expiresIn: 60 * 60 * 24,
  },
  // swagger配置
  swagger: {
    title: 'jay-music-manage-system',
    description: '音乐管理系统',
    auth: {
      authType: 'bearer',
    },
  },
  // 跨域设置
  cors: {
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    origin: req => req.headers.origin,
  },
  // 日志配置
  midwayLogger: {
    clients: {
      coreLogger: {
        level: 'debug',
        consoleLevel: 'debug',
      },
      appLogger: {
        level: 'debug',
        consoleLevel: 'debug',
      },
    },
  },
  upload: {
    // mode: UploadMode, 默认为file，即上传到服务器临时目录，可以配置为 stream
    mode: 'file',
    // fileSize: string, 最大上传文件大小，默认为 256mb
    fileSize: '256mb',
    // whitelist: string[]，文件扩展名白名单
    whitelist: uploadWhiteList.filter(ext => ext === '.mp3'),
    // tmpdir: string，上传的文件临时存储路径
    tmpdir: join(tmpdir(), 'midway-upload-files'),
    // cleanTimeout: number，上传的文件在临时目录中多久之后自动删除，默认为 5 分钟
    cleanTimeout: 5 * 60 * 1000,
    // base64: boolean，设置原始body是否是base64格式，默认为false，一般用于腾讯云的兼容
    base64: false,
    // 仅在匹配路径到 /music-api/song/upload 的时候去解析 body 中的文件信息
    match: /\/api\/song\/upload/,
  },
  oss: {
    clients: {
      // normal oss bucket
      normal: {
        timeout: '60s',
        accessKeyId: process.env.OSS_ACCESSKEY_ID,
        accessKeySecret: process.env.OSS_ACESSKEY_SECRET,
        bucket: process.env.OSS_BUCKET_NAME,
        endpoint: process.env.OSS_ENDPOINT,
      },
      // sts oss bucket
      // if config.sts == true, oss will create STS client
      sts: {
        sts: true,
        accessKeyId: process.env.OSS_ACCESSKEY_ID,
        accessKeySecret: process.env.OSS_ACESSKEY_SECRET,
      },
    },
  },
  cache: {
    store: redisStore,
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: 0,
      keyPrefix: 'cache:',
      ttl: 60,
    },
  },
  captcha: {
    default: {
      // 默认配置
      size: 4,
      noise: 2,
      width: 120,
      height: 40,
    },
    image: {
      // 最终会合并 default 配置
      type: 'mixed',
    },
    formula: {}, // 最终会合并 default 配置
    text: {}, // 最终会合并 default 配置
    expirationTime: 60,
    idPrefix: 'midway:vc',
  },
} as MidwayConfig;
