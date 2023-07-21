import { Inject, Provide } from '@midwayjs/decorator';
import { LyricResponse, NETEASEAPI, NeteaseResponse, SingleSongsResponse } from '../common/NeteaseAPIType';
import { ILogger } from '@midwayjs/core';
import { cloudsearch, lyric, Response } from 'NeteaseCloudMusicApi';
import { ErrorCode } from '../common/ErrorCode';
import { Assert } from '../common/Assert';

@Provide()
export class CloudService implements NETEASEAPI {
  @Inject()
  logger: ILogger;

  static responseInterceptorHandler(status: number, body: NeteaseResponse) {
    const errText = 'NeteaseAPI Failed';
    // 1. 正确响应的请求状态码为200，否则抛出异常
    Assert.isTrue(status === 200, ErrorCode.SYS_ERROR, errText);
    // 2. 网易云正确响应的data应是NeteaseResponse对象，如果为空则抛出异常
    Assert.notNull(body, ErrorCode.SYS_ERROR, errText);
    // 3. NeteaseResponse对象的code正常状态下应该是200，否则抛出异常
    Assert.isTrue(body.code === 200, ErrorCode.SYS_ERROR, errText);
  }

  async getMusicsWithKeywords(keywords: string): Promise<SingleSongsResponse> {
    const { status, body }: Response<NeteaseResponse> = await cloudsearch({
      keywords,
      type: 1,
      limit: 100,
    });
    CloudService.responseInterceptorHandler(status, body);
    this.logger.info('NeteaseAPI Response %j', JSON.stringify(body));
    return body as SingleSongsResponse;
  }

  async getLyricWithId(id: number): Promise<LyricResponse> {
    const { status, body }: Response<NeteaseResponse> = await lyric({ id });
    CloudService.responseInterceptorHandler(status, body);
    this.logger.info('NeteaseAPI Response %j', JSON.stringify(body));
    return body as LyricResponse;
  }
}