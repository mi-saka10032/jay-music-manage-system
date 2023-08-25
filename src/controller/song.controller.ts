import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { Body, Controller, Files, Inject, Post, Query } from '@midwayjs/decorator';
import { BaseController } from '../common/BaseController';
import { Song } from '../entity/song';
import { SongListVO, SongVO } from '../music-api/vo/SongVO';
import { Context } from '@midwayjs/koa';
import { SongService } from '../service/song.service';
import { BaseService } from '../common/BaseService';
import { App, ILogger } from '@midwayjs/core';
import {
  AudioFile,
  AudioFormatOption,
  NewSongDTO,
  Relation_Album_SongDTO,
  Relation_Singer_SongDTO,
  Shelve_Album_SongDTO,
  Shelve_Singer_SongDTO,
  SongDTO,
  UpdateSongDTO,
} from '../music-api/dto/SongDTO';
import { ArtistResponse, LyricResponse, SingleSong, SingleSongsResponse } from '../common/NeteaseAPIType';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../music-api/code/ErrorCode';
import { CloudService } from '../service/cloud.service';
import { Page } from '../common/Page';
import { Application } from '@midwayjs/ws';
import { Constant } from '../common/Constant';
import { SocketSongEnum, SocketSongResponse } from '../music-api/code/SocketSongEnum';

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

  @App('webSocket')
  wsApp: Application;

  private sendSocket(data: object): void {
    // 判断cookie-socketId来获取指定socket实例
    const socketId = this.ctx.cookies.get(Constant.getSocketId(), { signed: false, encrypt: false });
    if (socketId) {
      this.wsApp.clients.forEach(ws => {
        // 已连接实例的socketId已在连接时为Context绑定
        if (ws['socketId'] === socketId) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  }

  /**
   * @description 该方法包含四部分逻辑，与db无交互
   * 1. 首先接收上传文件并解析文件内部的音频信息；
   * 2. 与音频信息解析同步进行的还有文件信息上传OSS或者保存本地生成播放/下载链接的步骤；
   * 3. 然后根据音频信息调用网易云api查询其它字段并补全；
   * 4. 最后无论数据信息完整与否，统一返回给用户处理
   * @param audioFiles midway提供的文件泛型结构，filename为源文件名，data为服务器的临时文件地址
   */
  @Post('/upload', { description: '上传音频文件并返回音频解析结果' })
  async uploadAudioFiles(@Files() audioFiles: Array<AudioFile>): Promise<Array<AudioFormatOption>> {
    // 限制文件格式为音频格式
    audioFiles.forEach((audioFile: AudioFile) => {
      Assert.isTrue(audioFile.mimeType === 'audio/mpeg', ErrorCode.UN_ERROR, '上传文件必须是音频格式文件');
    });
    return Promise.all(
      audioFiles.map(async (audioFile: AudioFile): Promise<AudioFormatOption> => {
        const { filename, data: filepath } = audioFile;
        const songProgress: SocketSongResponse = { originalName: filename, status: SocketSongEnum.Start };
        this.logger.info('Start');
        this.sendSocket(songProgress);
        // 执行音频文件解析，返回解析结果
        const audioFormatOption: AudioFormatOption = await this.songService.analyzeAudioFile(audioFile);
        songProgress.status = SocketSongEnum.BasicAnalysis;
        this.logger.info('BasicAnalysisComplete');
        this.sendSocket(songProgress);
        // 绑定oss的文件url
        audioFormatOption.musicUrl = await this.songService.uploadOSSService(filepath);
        songProgress.status = SocketSongEnum.OSS;
        this.logger.info('OSSComplete');
        this.sendSocket(songProgress);
        // isExact决定解析结果是否准确，不准确则不会调用网易云cloudService查询精确信息
        const { isExact } = audioFormatOption;
        // songName和singerName作为解析结果的一部分，用来确认和匹配cloudService查询结果
        const songName = audioFormatOption.songName;
        const singerName = audioFormatOption.singer.singerName;
        if (isExact) {
          this.logger.info('NetEaseAPIStart');
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
          this.logger.info('NetEaseAPIComplete');
        }
        this.logger.info('DetailAnalysisEnd');
        songProgress.status = SocketSongEnum.DetailAnalysis;
        this.sendSocket(songProgress);
        return audioFormatOption;
      })
    );
  }

  @Post('/create', { description: '新增单曲' })
  async createSong(@Body() newSongDTO: NewSongDTO): Promise<SongVO> {
    Assert.notNull(newSongDTO.songName, ErrorCode.UN_ERROR, '歌曲名称不能为空');
    Assert.notNull(newSongDTO.duration, ErrorCode.UN_ERROR, '歌曲时长不能为空');
    Assert.notNull(newSongDTO.musicUrl, ErrorCode.UN_ERROR, '歌曲链接不能为空');
    return this.songService.createSong(newSongDTO);
  }

  @ApiBody({ type: NewSongDTO, isArray: true })
  @Post('/batchCreate', { description: '批量新增单曲' })
  async batchCreateSingleSongs(@Body() newSongDTOList: Array<NewSongDTO>): Promise<Array<SongVO>> {
    return Promise.all(newSongDTOList.map((newSongDTO: NewSongDTO) => this.createSong(newSongDTO)));
  }

  @ApiResponse({ type: SongListVO })
  @Post('/page', { description: '歌曲分页查询' })
  async querySingleSongs(@Body() songDTO: SongDTO): Promise<Page<SongVO>> {
    Assert.baseAssert_QueryPage(songDTO);
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
    return this.songService.querySongs(songDTO, pageNo, pageSize);
  }

  @Post('/update', { description: '更新单曲' })
  async updateSingleSongs(@Body() updateSongDTO: UpdateSongDTO): Promise<UpdateSongDTO> {
    Assert.baseAssert_UpdateObj(updateSongDTO);
    Assert.baseAssert_UpdateId(updateSongDTO.id);
    Assert.notArray(updateSongDTO.singerIds, ErrorCode.UN_ERROR, 'singerIds不是数组');
    return this.songService.updateSong(updateSongDTO);
  }

  /** 该接口已弃用 由 updateSingleSongs 直接实现 */
  @Post('/shelveAlbumId', { description: '关联/取消关联专辑' })
  async shelveAlbumById(@Body() body: Shelve_Album_SongDTO): Promise<boolean> {
    Assert.baseAssert_QueryOne(body);
    Assert.notNull(body.albumId, ErrorCode.UN_ERROR, 'albumId不能为空');
    Assert.notNull(body.songId, ErrorCode.UN_ERROR, 'songId不能为空');
    const { albumId, songId, shelve } = body;
    await this.songService.shelveAlbum_Song(albumId, songId, shelve);
    return true;
  }

  /** 该接口已弃用 由 updateSingleSongs 直接实现 */
  @Post('/shelveSingerId', { description: '关联/取消关联歌手' })
  async shelveSingerById(@Body() body: Shelve_Singer_SongDTO): Promise<boolean> {
    Assert.baseAssert_QueryOne(body);
    Assert.notNull(body.singerIds, ErrorCode.UN_ERROR, 'singerIds不能为空');
    Assert.notNull(body.songId, ErrorCode.UN_ERROR, 'songId不能为空');
    const { singerIds, songId, shelve } = body;
    await this.songService.shelveSinger_Song(singerIds, songId, shelve);
    return true;
  }

  @Post('/findById', { description: '根据id查询歌曲' })
  async findSingleSongById(@Query('id') id: number): Promise<SongVO> {
    Assert.baseAssert_FindId(id);
    return this.songService.findSongById(id);
  }

  @Post('/delete', { description: '删除单曲' })
  async deleteSingleSongById(@Query('id') id: number): Promise<boolean> {
    Assert.baseAssert_DeleteId(id);
    await this.songService.deleteSong(id);
    return true;
  }

  @ApiResponse({ type: Relation_Album_SongDTO })
  @Post('/pageByAlbumId', { description: '根据专辑id分页查询歌曲' })
  async querySingleSongsByAlbumId(@Body() relation: Relation_Album_SongDTO): Promise<Page<SongVO>> {
    Assert.baseAssert_QueryPage(relation);
    Assert.notNull(relation.albumId, ErrorCode.UN_ERROR, '专辑id不能为空');
    const { albumId, pageNo, pageSize } = relation;
    return this.songService.findSongsByAlbumId(albumId, pageNo, pageSize);
  }

  @ApiResponse({ type: Relation_Singer_SongDTO })
  @Post('/pageSingerId', { description: '根据歌手id分页查询歌曲' })
  async querySingleSongsBySingerId(@Body() relation: Relation_Singer_SongDTO): Promise<Page<SongVO>> {
    Assert.baseAssert_QueryPage(relation);
    Assert.notNull(relation.singerId, ErrorCode.UN_ERROR, '歌手id不能为空');
    const { singerId, pageNo, pageSize } = relation;
    return this.songService.findSongsBySingerId(singerId, pageNo, pageSize);
  }
}
