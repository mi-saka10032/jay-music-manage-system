import { afterHandler, beforeHandler, ServiceContext } from '../utils/serviceLifeCycle';
import { CloudService } from '../../src/service/cloud.service';

describe('test/service/cloud.test.ts', () => {

  const context: ServiceContext<CloudService> = {
    app: null,
    service: null as CloudService
  };
  // 以下变量数据来自网易云音乐NodeJS API提供示例
  const keywords = '海阔天空';
  const lyricId = 33894312;
  const artistId = 11972054;

  beforeAll(beforeHandler.bind(null, context, CloudService));

  afterAll(afterHandler.bind(null, context));

  // search a song
  it('test service.neteaseCloud search a song', async () => {
    const result = await context.service.getMusicsWithKeywords(keywords);
    expect(result.code).toBe(200);
  });

  // search some lyric
  it('test service.neteaseCloud search some lyric', async () => {
    const result = await context.service.getLyricWithId(lyricId);
    expect(result.code).toBe(200);
  });

  // search an artist
  it('test service.neteaseCloud search an artist', async () => {
    const result = await context.service.getArtistWithId(artistId);
    expect(result.code).toBe(200);
  })

});
