import { Inject, Provide } from '@midwayjs/decorator';
import {
  ArtistResponse,
  LyricResponse,
  NETEASEAPI,
  NeteaseResponse,
  SingleSong,
  SingleSongsResponse,
} from '../common/NeteaseAPIType';
import { cloudsearch, lyric, artist_detail, Response } from 'NeteaseCloudMusicApi';
import { ErrorCode } from '../music-api/code/ErrorCode';
import { Assert } from '../common/Assert';
import { AudioFormatOption } from '../music-api/dto/SongDTO';
import { ILogger } from '@midwayjs/core';

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

  /**
   * @description 相对准确的音频结果解析（不需要返回值，audioFormatOption为传递对象）
   * @param audioFormatOption 音频源数据
   * @param songName 歌曲名称
   * @param singerName 歌手名称
   */
  async exactlyAudioAnalysis(audioFormatOption: AudioFormatOption, songName: string, singerName: string) {
    this.logger.info('NetEaseAPIStart');
    // 首次调用cloudService，根据关键词查询单曲信息
    const keywords: string = songName + '-' + singerName;
    const response: SingleSongsResponse = await this.getMusicsWithKeywords(keywords);
    let musicId = 0;
    let artistId = 0;
    const songs: Array<SingleSong> = response.result.songs;
    // 遍历歌曲信息，过滤查找第一个符合条件的歌曲对象
    for (let i = 0; i < songs.length; i++) {
      const singleSong: SingleSong = songs[i];
      const curSongName: string = singleSong.name;
      // 如果歌手ar列表长度为0，说明歌曲不含歌手信息，跳过本次循环
      if (singleSong.ar.length === 0) continue;
      const { id: curSingerId, name: curSingerName } = singleSong.ar[0];
      // 歌曲名称和歌手名称均匹配，进入赋值环节，否则继续遍历查找
      if (songName === curSongName && singerName === curSingerName) {
        // 赋值歌曲id和歌手id，用于后续cloudService二次调用
        musicId = singleSong.id;
        artistId = curSingerId;
        // 专辑名称albumName 专辑封面coverUrl 赋值
        audioFormatOption.album.albumName = singleSong.al.name ?? '';
        audioFormatOption.album.coverUrl = singleSong.al.picUrl ?? '';
        // 专辑和单曲的发布时间赋值
        if (singleSong.publishTime !== 0 && singleSong.publishTime != null) {
          audioFormatOption.publishTime = new Date(singleSong.publishTime);
          audioFormatOption.album.publishTime = new Date(singleSong.publishTime);
        }
        break;
      }
    }
    // 判断id以二次调用cloudService，查找歌词和歌手
    if (musicId !== 0 && artistId !== 0) {
      const [lyricResponse, artistResponse]: [LyricResponse, ArtistResponse] = await Promise.all([
        this.getLyricWithId(musicId),
        this.getArtistWithId(artistId),
      ]);
      // 解析结果的歌词赋值
      audioFormatOption.lyric = lyricResponse.lrc.lyric;
      // 解析结果的歌手照片赋值
      audioFormatOption.singer.coverUrl = artistResponse.data.artist.avatar;
    }
    this.logger.info('NetEaseAPIComplete');
  }
}
