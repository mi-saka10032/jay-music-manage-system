<h1 style="text-align: center">music-manage-system</h1>
<div style="text-align: center">

music-manage-system是基于阿里巴巴后端框架Midway和参考项目框架模板[midway-boot](https://github.com/bestaone/midway-boot)
构建的一套包含常用功能的小型音乐管理系统

系统库表结构不复杂，但是基本涵盖了1-1、1-N、M-N等表查询，同时提供了阿里云OSS、死锁、ORM查询等系统方案。

[![framework](https://img.shields.io/badge/midway-3.x-brightgreen)](https://midwayjs.org/)
[![version](https://img.shields.io/badge/version-1.0.0-brightgreen)](https://github.com/mi-saka10032/jay-music-manage-system)
[![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/mi-saka10032/jay-music-manage-system/blob/main/LICENSE)

</div>

## 项目介绍

### 模板来源

系统框架模板源自[midway-boot](https://github.com/bestaone/midway-boot)，在框架基础上对`src/common`中的基础封装类进行了二次改造与功能扩充。

### 关联项目

关联的前端项目仓库：<https://github.com/mi-saka10032/music-system-admin>

该项目是基于后端接口的前端完整实现项目。

### 技术栈

- TypeScript
- Nodejs
- Midway
- Mysql
- TypeORM
- Redis
- 阿里云OSS

### 特性&功能

- 面向对象的开发体验；
- 增删改查及基类封装；
- 数据库操作；
- 缓存操作；
- 用户安全认证及访问安全控制；
- JWT访问凭证；
- 分布式访问状态管理；
- 密码加解密；
- 统一返回结果封装；
- 统一异常管理；
- Snowflake主键生成；
- Swagger集成及支持访问认证；
- 环境变量的使用；
- Docker镜像构建；
- Serverless发布；
- mp3文件二进制数据信息解析；
- 网易云NodeAPI歌曲详细信息查找；
- 验证码生成；
- Websocket实时通信；
- 阿里云OSS直传与STSToken验证；

### 目录结构

```
├─doc                     # 相关文档
├─src                     # 源码目录
│  ├─common               # 通用类
│  ├─config               # 配置
│  ├─controller           # 控制器
│  ├─decorator            # 装饰器
│  ├─entity               # 数据对象模型
│  ├─filter               # 过滤器
│  ├─middleware           # 中间件
│  ├─music-api            # api接口定义及输入输出定义(git子仓库)
│  ├─service              # 服务类
│  ├─socket               # websocket控制器
│  ├─utils                # 工具类
│  ├─configurations.ts    # 服务生命周期管理及配置
│  └─interface.ts         # 接口定义
├─test                    # 测试类目录
├─.env                    # 环境变量(需要你参考.env.template自行补充)
├─.env.template           # 环境变量(.env的参考文件，不影响项目)
├─app.js                  # 支持发布Serverless
├─bootstrap.js            # 启动入口
├─Dockerfile              # Docker构建文件
├─f.yml                   # Serverless标准化spec配置文件
```

## 快速启动

### 环境要求

- NodeJS v16+，建议最好是v18+（个人验证v16+正常运行，v16以下运行websocket对于小内存机器会有OOM（内存溢出）问题）
- Npm 8+
- MySQL8+
- Redis7+（Redis的windows版本比较难找，github有开源链接：<https://github.com/redis-windows/redis-windows/releases/tag/7.0.12>）
- 阿里云OSS账号资源

**注意阿里云OSS绑定上传与STSToken生成功能，如果没有账号及相关配置，上传功能无法正常使用**

**作为替代手段，可以重写上传OSS方法，提供上传接口，将文件存储至服务器目录（不推荐，挤占服务器空间且效率低下）**

### 下载与安装

```bash
git clone git@github.com:mi-saka10032/jay-music-manage-system.git

# 项目里有git子仓库，需要初始化并更新子仓库内容
# 这个指令只在第一次克隆时使用
git submodule init

# 更新子仓库内容到最新分支记录
git submodule update
```

执行完 submodule 命令后如果`src/music-api`目录下不为空则子仓库拉取成功

### 调整配置

#### 创建数据库schema

在mysql中创建名称为 `jay_music_manage_system` 的 schema

这是默认的schema名字，如果要自行命名，`src/config/config.default.ts`中修改typeorm相关的配置项

> src/config/config.default.ts -> orm.synchronize=true，可控制程序启动时自动创建、更新表结构，但是需要先把数据库schema建好

```ts
export default {
  // ...
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: 'jay_music_manage_system',    // 改成和自定义的schema相同的名字
        synchronize: false, // 如果第一次使用，不存在表，有同步的需求可以写 true
        logging: true,
        entities: ['**/entity/*{.ts,.js}'],
      },
    },
  }
}
```

#### 导入初始化的mysql数据（可选）

// TODO

#### 新建并调整配置文件 .env 内容

> 新建.env文件之前，先把 .gitignore 文件中最后一行 .env 删掉，保证 .env 能被git控制
> （我个人的 .env 文件是发布后在jenkins工作流上自动生成的，所以这里不需要git控制 .env ）

```bash
MYSQL_HOST=localhost                      # 你的mysql数据库IP 或者 域名
MYSQL_USERNAME=root                       # 你的mysql数据库用户名（需要有建表权限）
MYSQL_PASSWORD=your_mysql_password        # 你的mysql数据库密码
MYSQL_PORT=3306                           # 你的mysql数据库端口
REDIS_HOST=localhost                      # 你的redis IP 或者 域名
REDIS_PORT=6379                           # 你的redis端口
OSS_ACCESSKEY_ID=阿里云OSS-ID              # 阿里云OSS常规配置
OSS_ACESSKEY_SECRET=阿里云OSS-SECRET       # 阿里云OSS常规配置
OSS_BUCKET_NAME=misaka10032               # 阿里云OSS常规配置
OSS_ENDPOINT=oss-cn-chengdu.aliyuncs.com  # 阿里云OSS常规配置
OSS_ROLEARN=阿里云OSS-ROLEARN              # 阿里云OSS-STS服务配置
OSS_PREFIX=阿里云OSS-静态链接地址前缀         # 阿里云OSS静态链接地址前缀
```

阿里云OSS相关文档链接如下：

<https://help.aliyun.com/zh/oss/user-guide/regions-and-endpoints?spm=a2c4g.11186623.4.1.668c7292iDbqAN&scm=20140722.H_31837._.ID_31837-OR_rec-V_1>

<https://help.aliyun.com/zh/oss/developer-reference/manage-bucket-policies?spm=a2c4g.11186623.0.0.15fe7f80TXsuQ2>

<https://help.aliyun.com/zh/oss/developer-reference/authorized-access-3?spm=a2c4g.11186623.0.0.29076d73jQuJmf#section-zkq-3rq-dhb>

#### 构建、启动

**启动之前，确认mysql和redis服务已正常启动**

```bash
# 按顺序执行
cd jay-music-manage-system

npm install       # 安装依赖

npm run test      # 运行单元测试，这过程会检查mysql、redis是否配置正确

npm run dev       # 启动服务
```

> `npm run test`运行时，`test/service/user.test.ts` 会创建测试账号，账号misaka10032，密码123456abc
> 程序启动时会自动生成表结构，不需要手动创建表结构（但是需要先把数据库schema建好）
> 如果测试通不过，检查下数据库有没有自动生成测试账号

#### 测试、验证

访问Swagger：http://127.0.0.1:7001/swagger-ui/index.html

## 开发调试

访问Swagger：http://127.0.0.1:7001/swagger-ui/index.html

// TODO
获取验证码id、服务器控制台获取真实验证码文本

// TODO
登录、获取、复制token

## 部署

### pm2

```bash
npm install
npm run build
npm run pmstart
```

### Docker

```bash
docker build -t music-manage-system:v1.0 .

docker run -d --name music-manage-system -p 17001:7001 --env-file /opt/.env music-manage-system:v1.0
```

注意pm2在docker中部署时指令需要做出调整，详见：[midway-pm2-容器启动](https://www.midwayjs.org/docs/extensions/pm2#docker-%E5%AE%B9%E5%99%A8%E5%90%AF%E5%8A%A8)

## 授权协议

本项目执行 [MIT](https://github.com/mi-saka10032/jay-music-manage-system/blob/main/LICENSE) 协议
