import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { Body, Controller, Files, Inject, Post, Query } from '@midwayjs/decorator';
import { BaseController } from '../common/BaseController';
import { Song } from '../entity/song';
import { SongListVO, SongVO } from '../api/vo/SongVO';
import { Context } from '@midwayjs/koa';
import { SongService } from '../service/song.service';
import { BaseService } from '../common/BaseService';
import { ILogger } from '@midwayjs/core';
import { AudioFile, AudioFormatOption, NewSongDTO, SongDTO, UpdateSongDTO } from '../api/dto/SongDTO';
import { ArtistResponse, LyricResponse, SingleSong, SingleSongsResponse } from '../common/NeteaseAPIType';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { CloudService } from '../service/cloud.service';

@ApiTags(['song'])
@ApiBearerAuth()
@Controller('/api/song')
export class SongController extends BaseController<Song, SongVO> {
  @Inject()
  ctx: Context;

  @Inject()
  logger: ILogger;

  @Inject()
  songService: SongService;

  getService(): BaseService<Song, SongVO> {
    return this.songService;
  }

  @Inject()
  cloudService: CloudService;

  /**
   * @description 该方法包含四部分逻辑，与db无交互
   * 1. 首先接收上传文件并解析文件内部的音频信息；
   * 2. 与音频信息解析同步进行的还有文件信息上传OSS或者保存本地生成播放/下载链接的步骤；
   * 3. 然后根据音频信息调用网易云api查询其它字段并补全；
   * 4. 最后无论数据信息完整与否，统一返回给用户自行判断
   * @param audioFiles midway提供的文件泛型结构，filename为源文件名，data为服务器的临时文件地址
   */
  @Post('/upload', { description: '上传音频文件并返回音频解析结果' })
  async uploadAudioFiles(@Files() audioFiles: Array<AudioFile>): Promise<Array<AudioFormatOption>> {
    return Promise.all(
      audioFiles.map(async (audioFile: AudioFile): Promise<AudioFormatOption> => {
        this.logger.info('analysis-start');
        // 执行音频文件解析，返回解析结果
        const audioFormatOption: AudioFormatOption = await this.songService.analyzeAudioFile(audioFile);
        this.logger.info('analysis&oss-complete');
        // isExact决定解析结果是否准确，不准确则不会调用网易云cloudService查询精确信息
        const { isExact } = audioFormatOption;
        // songName和singerName作为解析结果的一部分，用来确认和匹配cloudService查询结果
        const songName = audioFormatOption.songName;
        const singerName = audioFormatOption.singer.singerName;
        if (isExact) {
          this.logger.info('neteaseAPI-start');
          // 首次调用cloudService，根据关键词查询单曲信息
          const keywords: string = songName + '-' + singerName;
          const response: SingleSongsResponse = await this.cloudService.getMusicsWithKeywords(keywords);
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
              this.logger.info('matched song %j', JSON.stringify(singleSong));
              break;
            }
          }
          // 判断id以二次调用cloudService，查找歌词和歌手
          if (musicId !== 0 && artistId !== 0) {
            const [lyricResponse, artistResponse]: [LyricResponse, ArtistResponse] = await Promise.all([
              this.cloudService.getLyricWithId(musicId),
              this.cloudService.getArtistWithId(artistId),
            ]);
            // 解析结果的歌词赋值
            audioFormatOption.lyric = lyricResponse.lrc.lyric;
            // 解析结果的歌手照片赋值
            audioFormatOption.singer.coverUrl = artistResponse.data.artist.avatar;
          }
          this.logger.info('neteaseAPI-complete');
        }
        this.logger.info('analysis-end');
        return audioFormatOption;
      })
    );
  }

  @Post('/create', { description: '新增单曲' })
  async createSingleSong(@Body() newSongDTO: NewSongDTO) {
    Assert.notNull(newSongDTO.songName, ErrorCode.UN_ERROR, '歌曲名称不能为空');
    Assert.notNull(newSongDTO.duration, ErrorCode.UN_ERROR, '歌曲时长不能为空');
    Assert.notNull(newSongDTO.musicUrl, ErrorCode.UN_ERROR, '歌曲链接不能为空');
    await this.songService.createSingleSong(newSongDTO);
  }

  @ApiBody({ type: NewSongDTO, isArray: true })
  @Post('/batchCreate', { description: '批量新增单曲' })
  async batchCreateSingleSongs(@Body() newSongDTOList: Array<NewSongDTO>) {
    await Promise.all(newSongDTOList.map((newSongDTO: NewSongDTO) => this.createSingleSong(newSongDTO)));
  }

  @ApiResponse({ type: SongListVO })
  @Post('/page', { description: '歌曲分页查询' })
  async querySingleSongs(@Body() songDTO: SongDTO) {
    const { startPublishTime, endPublishTime, pageNo, pageSize } = songDTO;
    // 开始或结束日期，一旦存在则需要进行日期格式断言
    if (startPublishTime) {
      Assert.notDate(startPublishTime, ErrorCode.UN_ERROR, 'startPublishTime不是一个有效日期');
      songDTO.startPublishTime = new Date(startPublishTime);
    }
    if (endPublishTime) {
      Assert.notDate(endPublishTime, ErrorCode.UN_ERROR, 'endPublishTime不是一个有效日期');
      songDTO.endPublishTime = new Date(endPublishTime);
    }
    Assert.notNull(pageNo != null && pageNo > 0, ErrorCode.UN_ERROR, 'pageNo不能为空');
    Assert.notNull(pageSize != null && pageSize > 0, ErrorCode.UN_ERROR, 'pageSize不能为空');
    return this.songService.page(songDTO, pageNo, pageSize);
  }

  @Post('/update', { description: '更新单曲' })
  async updateSingleSongs(@Body() updateSongDTO: UpdateSongDTO) {
    const { albumId, singerId } = updateSongDTO;
    delete updateSongDTO.albumId;
    delete updateSongDTO.singerId;
    const song: Song = new Song();
    Object.assign(song, updateSongDTO);
    return this.songService.update(song, albumId, singerId);
  }

  @Post('/delete', { description: '删除单曲' })
  async delete(@Query('id') id: number): Promise<boolean> {
    await this.songService.delete(id);
    return true;
  }
}
