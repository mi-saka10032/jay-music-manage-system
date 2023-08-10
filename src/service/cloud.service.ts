import { Provide } from '@midwayjs/decorator';
import {
  ArtistResponse,
  LyricResponse,
  NETEASEAPI,
  NeteaseResponse,
  SingleSongsResponse,
} from '../common/NeteaseAPIType';
import { cloudsearch, lyric, artist_detail, Response } from 'NeteaseCloudMusicApi';
import { ErrorCode } from '../music-api/code/ErrorCode';
import { Assert } from '../common/Assert';

@Provide()
export class CloudService implements NETEASEAPI {
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
    return body as SingleSongsResponse;
  }

  async getLyricWithId(id: number): Promise<LyricResponse> {
    const { status, body }: Response<NeteaseResponse> = await lyric({ id });
    CloudService.responseInterceptorHandler(status, body);
    return body as LyricResponse;
  }

  async getArtistWithId(id: number): Promise<ArtistResponse> {
    const { status, body }: Response<NeteaseResponse> = await artist_detail({ id });
    CloudService.responseInterceptorHandler(status, body);
    return body as ArtistResponse;
  }
}
