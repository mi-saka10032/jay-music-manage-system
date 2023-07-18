import { Inject, Provide } from '@midwayjs/decorator';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { ILogger } from '@midwayjs/core';
import { LyricResponse, NETEASEAPI, NeteaseResponse, SingleSongsResponse } from '../common/NeteaseAPIType';

@Provide()
export class AxiosService implements NETEASEAPI {
  axios: AxiosInstance;

  @Inject()
  logger: ILogger;

  constructor() {
    // 创建请求实例、取消请求对象、请求拦截、响应拦截
    this.axios = axios.create({
      baseURL: process.env.NETEASE_API, // 网易云API的公网ip
      timeout: 5000, // 过期时间自动释放对象
    });
    // 注意bind为拦截器函数绑定当前this对象
    this.axios.interceptors.request.use(this.requestHandler.bind(this), this.errorHandler);
    this.axios.interceptors.response.use(this.responseHandler.bind(this), this.errorHandler);
  }

  // 请求拦截器：基本信息打印
  requestHandler(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const { method, url, data } = config;
    this.logger.info('NeteaseAPI Request, method: %s, url: %s, data: %s', method, url, data);
    return config;
  }

  // 响应拦截器：基本信息打印与正确性判断
  responseHandler(response: AxiosResponse<NeteaseResponse>): NeteaseResponse {
    const { status, data } = response;
    const errText = 'NeteaseAPI Failed';
    this.logger.info('NeteaseAPI Response, status: %d, data: %j', status, JSON.stringify(data));
    // 1. 正确响应的请求状态码为200，否则抛出异常
    Assert.isTrue(status === 200, ErrorCode.SYS_ERROR, errText);
    // 2. 网易云正确响应的data应是NeteaseResponse对象，如果为空则抛出异常
    Assert.notNull(data, ErrorCode.SYS_ERROR, errText);
    // 3. NeteaseResponse对象的code正常状态下应该是200，否则抛出异常
    Assert.isTrue(data.code === 200, ErrorCode.SYS_ERROR, errText);
    return data;
  }

  // 错误拦截器：打印错误信息
  errorHandler(err: Error): any {
    Assert.neteaseFail(ErrorCode.SYS_ERROR, String(err));
  }

  async getMusicsWithKeywords(keywords: string): Promise<SingleSongsResponse> {
    return this.axios.get(`/cloudsearch?type=1&limit=100&keywords=${keywords}`);
  }

  async getLyricWithId(id: number): Promise<LyricResponse> {
    return this.axios.get(`/lyric?id=${id}`);
  }
}
