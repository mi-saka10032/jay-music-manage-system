import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, BatchWhereOption } from '../common/BaseService';
import { Song } from '../entity/song';
import { SongVO } from '../music-api/vo/SongVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AudioFile, AudioFormatOption, NewSongDTO, SongDTO, UpdateSongDTO } from '../music-api/dto/SongDTO';
import { createReadStream, ReadStream } from 'fs';
import { IAudioMetadata, parseNodeStream } from 'music-metadata-browser';
import { ILogger } from '@midwayjs/core';
import { OSSServiceFactory, OSSSTSService } from '@midwayjs/oss';
import { ErrorCode } from '../music-api/code/ErrorCode';
import { SnowflakeIdGenerate } from '../utils/Snowflake';
import { AlbumService } from './album.service';
import { SingerService } from './singer.service';
import { Album } from '../entity/album';
import { UserService } from './user.service';
import { Singer } from '../entity/singer';
import { SingerVO } from '../music-api/vo/SingerVO';
import { AlbumVO } from '../music-api/vo/AlbumVO';
import { NewAlbumDTO } from '../music-api/dto/AlbumDTO';
import { NewSingerDTO } from '../music-api/dto/SingerDTO';
import { Page } from '../common/Page';
import { CommonException } from '../common/CommonException';
import { defaultPageNo, defaultPageSize } from '../decorator/page.decorator';
import { RedisService } from '@midwayjs/redis';
import { OSSSTSTokenVO } from '../music-api/vo/OSSVO';

@Provide()
export class SongService extends BaseService<Song, SongVO> {
  @InjectEntityModel(Song)
  model: Repository<Song>;

  getModel(): Repository<Song> {
    return this.model;
  }

  getVO(): SongVO {
    return new SongVO();
  }

  getColumns(): Array<keyof SongVO> {
    return ['id', 'songName', 'duration', 'lyric', 'musicUrl', 'publishTime'];
  }

  @Inject()
  logger: ILogger;

  @Inject()
  ossServiceFactory: OSSServiceFactory;

  @Inject()
  idGenerate: SnowflakeIdGenerate;

  @Inject()
  albumService: AlbumService;

  @Inject()
  singerService: SingerService;

  @Inject()
  userService: UserService;

  @Inject()
  cacheUtil: RedisService;

  /**
   * @description 解析音频文件的相关信息
   * @param filepath upload组件将上传的文件做成了临时文件目录的模式，因此使用filepath即可获得相应文件路径
   */
  private async analyzeAudioMetadataByPath(filepath: string): Promise<IAudioMetadata> {
    const stream: ReadStream = createReadStream(filepath);
    // MusicMetadata自带解析Stream完成后关闭Stream，无需手动关闭ReadStream
    return await parseNodeStream(stream);
  }

  /**
   * @description 解析音频文件流
   */
  private async analyzeAudioStreamByStream(stream: ReadStream): Promise<IAudioMetadata> {
    // MusicMetadata自带解析Stream完成后关闭Stream，无需手动关闭ReadStream
    return await parseNodeStream(stream);
  }

  /**
   * @description 上传OSS服务
   * @param filepath upload组件将上传的文件做成了临时文件目录的模式，因此使用filepath即可获得相应文件路径
   * @private
   */
  async uploadOSSService(filepath: string): Promise<string> {
    const filename = this.idGenerate.generate();
    this.logger.info('startUploadOSS');
    const result = await this.ossServiceFactory.get('normal').put(`/music/${String(filename)}.mp3`, filepath);
    this.logger.info('OSSResult %j', JSON.stringify(result));
    return result.url;
  }

  async sendSTSService(): Promise<OSSSTSTokenVO> {
    const roleArn = process.env.OSS_ROLEARN;
    const result = await this.ossServiceFactory.get<OSSSTSService>('sts').assumeRole(roleArn);
    return {
      accessKeyId: result.credentials.AccessKeyId,
      accessKeySecret: result.credentials.AccessKeySecret,
      stsToken: result.credentials.SecurityToken,
      region: process.env.OSS_PREFIX,
      bucket: process.env.OSS_BUCKET_NAME,
    };
  }

  /**
   * @description 分析音频文件最终结果
   * 2. 返回最终分析结果
   * @param metadata 初步解析的音频结果
   * @param filename 用于逻辑识别的原上传文件名
   */
  getFinalAnalysisResult(metadata: IAudioMetadata, filename: string): AudioFormatOption {
    const audioOption: AudioFormatOption = new AudioFormatOption();
    // 已知可返回的信息：歌名、歌曲时长、专辑名、歌手名，其中专辑名和歌手名需要在controller二次查表确认做关联
    audioOption.songName = metadata.common.title ?? ''; // 解析结果歌名title为空则赋空值，下面判断准确度后再默认赋予不带后缀的文件名
    audioOption.album = new NewAlbumDTO();
    audioOption.album.albumName = metadata.common.album ?? ''; // 解析结果专辑名album为空则赋空值，后续二次执行查找
    // 解析结果歌手信息artists为空则赋空数组，后续二次执行查找
    audioOption.singer = new NewSingerDTO();
    if (metadata.common.artists?.length > 0) {
      // 解析出多个歌手的情况下，只取第一个歌手信息，否则解析量过大
      audioOption.singer.singerName = metadata.common.artists[0];
    } else {
      audioOption.singer.singerName = '';
    }
    audioOption.duration = Math.round(metadata.format.duration) ?? 0; // 解析结果时长duration为空则赋0
    audioOption.isExact = true;
    // 当上述四个参数中除了album之外（某些单曲可以没有不附带专辑名）其它任意一个参数为空时说明解析结果并不准确，isExact为false
    if (audioOption.songName.length === 0 || audioOption.singer.singerName.length === 0 || audioOption.duration === 0) {
      audioOption.isExact = false;
      const lastIndex: number = filename.lastIndexOf('.');
      audioOption.songName = lastIndex > 0 ? filename.substring(0, lastIndex) : filename; // 解析结果不准确 默认取上传文件的不带后缀名的名称
    }
    return audioOption;
  }

  /**
   * @description 分析音频文件
   * 1. 解析音频结果
   * @param audioFile upload组件接收上传文件处理形成的格式
   */
  async analyzeAudioFile(audioFile: AudioFile): Promise<AudioFormatOption> {
    const { filename, data: filepath } = audioFile;
    const metadata: IAudioMetadata = await this.analyzeAudioMetadataByPath(filepath);
    return this.getFinalAnalysisResult(metadata, filename);
  }

  /**
   * @description 分析音频文件流
   * 1. 解析音频结果
   * @param stream OSS链接解析后的stream流
   * @param filename 用于逻辑识别的原上传文件名
   */
  async analyzeAudioStream(stream: ReadStream, filename: string): Promise<AudioFormatOption> {
    const metadata: IAudioMetadata = await this.analyzeAudioStreamByStream(stream);
    return this.getFinalAnalysisResult(metadata, filename);
  }

  /**
   * @description 查询并新增关联的Album专辑数据 新增歌曲方法时独有功能，意为新增歌曲时附带新增尚未添加的Album
   * @param albumDTO NewAlbumDTO
   * @return 此处返回值必须是Album实体类，因为后续后续还要执行关联实体更新，必须使用实体类
   */
  private async queryAndCreateRelatedAlbum(albumDTO: NewAlbumDTO): Promise<Album> {
    const { albumName, coverUrl, publishTime } = albumDTO;
    // Album存在则先执行查询，如果有查询结果则注入更新用户id并返回，如果无结果则新建Album再返回
    const result: Album = await this.albumService.model.findOne({ where: { albumName }, relations: ['songs'] });
    if (result?.id) {
      return result;
    } else {
      let album: Album = new Album();
      album.albumName = albumName;
      album.coverUrl = coverUrl;
      album.publishTime = publishTime;
      // 批量新增同名 Album 数据并发新增，易触发异常抛出，触发后选择直接二次查询数据值，不执行更新
      try {
        const newAlbum: AlbumVO = await this.albumService.create(album);
        album.id = newAlbum.id;
      } catch (error: any) {
        this.logger.error(error.toString());
        album = await this.albumService.model.findOne({ where: { albumName }, relations: ['songs'] });
      }
      return album;
    }
  }

  /**
   * @description 查询并新增关联的Singer歌手数据 新增歌曲方法时独有功能，意为新增歌曲时附带新增尚未添加的Singer
   * @param singer NewSingerDTO
   * @return 此处返回值必须是Singer实体类，因为后续后续还要执行关联实体更新，必须使用实体类
   */
  private async queryAndCreateRelatedSinger(singer: NewSingerDTO): Promise<Singer> {
    const { singerName, coverUrl } = singer;
    // Singer存在则先执行查询，如果有查询结果则注入更新用户id并返回，如果无结果则新建Singer再返回
    const result: Singer = await this.singerService.model.findOne({ where: { singerName }, relations: ['songs'] });
    if (result?.id) {
      return result;
    } else {
      let singer: Singer = new Singer();
      singer.singerName = singerName;
      singer.coverUrl = coverUrl;
      // 批量新增同名 Singer 数据并发新增，易触发异常抛出，触发后选择直接二次查询数据值，不执行更新
      try {
        const newSinger: SingerVO = await this.singerService.create(singer);
        singer.id = newSinger.id;
      } catch (error: any) {
        this.logger.error(error.toString());
        singer = await this.singerService.model.findOne({ where: { singerName }, relations: ['songs'] });
      }
      return singer;
    }
  }

  /**
   * @description redis乐观锁 解决批量createSong导致的死锁问题
   * 外部方法调用时注意最后需要释放锁
   * 注意该方法仅对单线程环境有效，在分布式系统下还需要额外判断进程
   * @param key redisKey
   */
  private async acquireLock(key) {
    // isLock : 1 | 0
    const isLock = await this.cacheUtil.setnx(key, Math.random().toString());
    if (isLock === 1) {
      // 如果获得了锁 直接返回true
      return true;
    } else {
      // 如果锁未被释放，则等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.acquireLock(key);
    }
  }

  /**
   * @description 新增歌曲 newSongDTO 可能包含多种信息，因此也会去查询关联的Album和Singer并新增尚未添加的相关数据
   * @param newSongDTO NewSongDTO
   */
  async createSong(newSongDTO: NewSongDTO): Promise<SongVO> {
    const song: Song = new Song();
    const keys: Array<string> = ['songName', 'duration', 'lyric', 'musicUrl', 'publishTime'];
    for (const key of keys) {
      song[key] = newSongDTO[key];
    }
    // 新建单曲数据获取id
    const result: SongVO = await super.create(song);
    song.id = result.id;
    const { album, singer, albumId, singerId } = newSongDTO;
    if ((album && album.albumName?.length > 0) || albumId) {
      let albumResult: Album = new Album();
      if (album && album.albumName?.length > 0) {
        // albumName若存在，则查询获取或新建Album获取实体，更新Album与Song关系
        albumResult = await this.queryAndCreateRelatedAlbum(album);
      } else if (albumId) {
        // 否则取albumId获取Album实体并关联Song
        albumResult = await this.albumService.model.findOne({ where: { id: albumId }, relations: ['songs'] });
      }
      if (albumResult.songs?.length > 0) {
        albumResult.songs.push(song);
      } else {
        albumResult.songs = [song];
      }
      // 批量更新同名专辑会触发死锁，使用redis锁解决
      const lockKey = 'album-lock';
      if (await this.acquireLock(lockKey)) {
        try {
          const albumVO: AlbumVO = await this.albumService.update(albumResult);
          // 去除多余的songs属性
          delete albumVO.songs;
          result.album = albumVO;
        } catch (error: any) {
          this.logger.error(error.toString());
        } finally {
          // 注意释放redis锁
          await this.cacheUtil.del(lockKey);
        }
      } else {
        this.logger.warn('Could not acquire lock');
      }
    }
    if ((singer && singer.singerName?.length > 0) || singerId) {
      // singers若存在，查询获取或新建Singer获取实体，更新Singer与Song关系
      let singerResult: Singer = new Singer();
      if (singer && singer.singerName?.length > 0) {
        singerResult = await this.queryAndCreateRelatedSinger(singer);
      } else if (singerId) {
        singerResult = await this.singerService.model.findOne({ where: { id: singerId }, relations: ['songs'] });
      }
      if (singerResult.songs?.length > 0) {
        singerResult.songs.push(song);
      } else {
        singerResult.songs = [song];
      }
      // 批量更新同名歌手会触发死锁，使用redis锁解决
      const lockKey = 'singer-lock';
      if (await this.acquireLock(lockKey)) {
        try {
          const singerVO: SingerVO = await this.singerService.update(singerResult);
          // 去除多余的songs属性
          delete singerVO.songs;
          result.singers = [singerVO];
        } catch (error: any) {
          this.logger.error(error.toString());
        } finally {
          // 注意释放redis锁
          await this.cacheUtil.del(lockKey);
        }
      } else {
        this.logger.warn('Could not acquire lock');
      }
    }
    return result;
  }

  /**
   * @description 建立查询连接池，指定查询列字段，注入查询条件
   * @param whereOptions BatchWhereOption格式的查询条件，依赖父类的builderBatchWhere方法遍历注入
   */
  private createBuilderWithWhereOptions(whereOptions: Array<BatchWhereOption>): SelectQueryBuilder<Song> {
    // 建立查询池
    const builder: SelectQueryBuilder<Song> = this.model
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.album', 'album')
      .leftJoinAndSelect('song.singers', 'singer');
    // 指定列查询
    const songSelect: Array<string> = this.getColumns().map((column: string) => `song.${column}`);
    const albumSelect: Array<string> = this.albumService.getColumns().map((column: string) => `album.${column}`);
    const singerSelect: Array<string> = this.singerService.getColumns().map((column: string) => `singer.${column}`);
    const selectOptions: Array<string> = [...songSelect, ...albumSelect, ...singerSelect];
    builder.select(selectOptions);
    // 条件注入
    this.builderBatchWhere(builder, whereOptions);
    return builder;
  }

  /**
   * @description 将[Array<Song>, number]类型转换为Page<SongVo>类型
   * @param manyAndCountResult getManyAndCount的await返回值
   * @param pageNo
   * @param pageSize
   */
  private transformPageVO(manyAndCountResult: [Array<Song>, number], pageNo: number, pageSize: number): Page<SongVO> {
    const [songList, total] = manyAndCountResult;
    const songListVO: Array<SongVO> = new Array<SongVO>();
    Object.assign(songListVO, songList);
    return Page.build(songListVO, total, pageNo, pageSize);
  }

  /**
   * @description 歌曲分页查询 涉及到联表操作
   * @param songDTO SongDTO
   * @param pageNo number
   * @param pageSize number
   */
  async querySongs(
    songDTO: SongDTO,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<SongVO>> {
    const { songName, lyric, albumName, singerName, startPublishTime, endPublishTime } = songDTO;
    // 设置查询条件
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'song', column: 'songName', key: 'songName', value: songName, condition: 'like' },
      { table: 'song', column: 'lyric', key: 'lyric', value: lyric, condition: 'like' },
      {
        table: 'song',
        column: 'publishTime',
        key: 'startPublishTime',
        value: startPublishTime,
        condition: 'moreThanOrEqual',
      },
      {
        table: 'song',
        column: 'publishTime',
        key: 'endPublishTime',
        value: endPublishTime,
        condition: 'lessThanOrEqual',
      },
      { table: 'album', column: 'albumName', key: 'albumName', value: albumName, condition: 'like' },
      { table: 'singer', column: 'singerName', key: 'singerName', value: singerName, condition: 'like' },
    ];
    // 建立查询池、指定列查询、where条件注入
    const builder: SelectQueryBuilder<Song> = this.createBuilderWithWhereOptions(whereOptions);
    // offset limit
    builder.skip((pageNo - 1) * pageSize);
    builder.take(pageSize);
    // 查询结果转换
    const result = await builder.getManyAndCount();
    return this.transformPageVO(result, pageNo, pageSize);
  }

  /**
   * **已弃用**
   * @description 将Album与Song实体关联/解除关联
   * @param albumId number
   * @param songId number
   * @param shelve true 关联 | false 解除关联
   */
  async shelveAlbum_Song(albumId: number, songId: number, shelve: boolean): Promise<void> {
    const song: Song = await this.model.findOne({ where: { id: songId }, relations: ['album'] });
    if (song && song.id) {
      if (shelve) {
        const album: Album = new Album();
        album.id = albumId;
        song.album = album;
        await super.update(song);
      } else {
        song.album = null;
        await super.update(song);
      }
    } else {
      throw new CommonException(ErrorCode.UN_ERROR, `Song:${songId}不存在`);
    }
  }

  /**
   **已弃用**
   * @description 将Singer与Song实体关联/解除关联
   * @param singerIds Array<number>
   * @param songId number
   * @param shelve true 关联 | false 解除关联
   */
  async shelveSinger_Song(singerIds: Array<number>, songId: number, shelve = true): Promise<void> {
    const song: Song = await this.model.findOne({ where: { id: songId }, relations: ['singers'] });
    if (song && song.id) {
      // 已存在的singerIds
      const existSingerIds: Array<number> = song.singers.map((singer: Singer) => Number(singer.id));
      const newSingerIds: Array<number> = singerIds.filter((id: number) => !existSingerIds.includes(id));
      const remainSingerIds: Array<number> = singerIds.filter((id: number) => existSingerIds.includes(id));
      if (shelve && newSingerIds.length > 0) {
        // 需要关联 shelve:true 并且具有不存在于已有 SingerIds 中的 newSingerIds 方才执行关联更新
        const singers: Array<Singer> = newSingerIds.map((id: number) => {
          const singer: Singer = new Singer();
          singer.id = id;
          return singer;
        });
        song.singers.push(...singers);
        await super.update(song);
      } else if (!shelve && remainSingerIds.length > 0) {
        // 不需要关联 shelve:false 并且具有存在于已有 SingerIds 中的 remainSingerIds 方才执行关联更新 方才解除关联并更新
        song.singers = song.singers.filter((singer: Singer) => !remainSingerIds.includes(Number(singer.id)));
        await super.update(song);
      }
    } else {
      throw new CommonException(ErrorCode.UN_ERROR, `Song:${songId}不存在`);
    }
  }

  /**
   * @description 歌曲更新 涉及联表 relations
   * @param updateSongDTO UpdateSongDTO
   */
  async updateSong(updateSongDTO: UpdateSongDTO): Promise<UpdateSongDTO> {
    const { id, albumId, singerIds } = updateSongDTO;
    const song: Song = await this.model.findOne({ where: { id }, relations: ['album', 'singers'] });
    const keys: Array<string> = ['songName', 'duration', 'lyric', 'musicUrl', 'publishTime'];
    for (const key of keys) {
      song[key] = updateSongDTO[key];
    }
    // album relation
    const album: Album = new Album();
    album.id = albumId ?? null;
    song.album = album;
    // singers relation
    song.singers = singerIds.map(id => {
      const singer = new Singer();
      singer.id = id;
      return singer;
    });
    await super.update(song);
    return updateSongDTO;
  }

  /**
   * @description 删除Song前先清除Singer的关联否则会报错
   * @param id
   */
  async deleteSong(id: number) {
    const song: Song = await this.model.findOne({ where: { id }, relations: ['singers'] });
    if (song && song.singers.length > 0) {
      song.singers = [];
      await super.update(song);
    }
    await super.delete(id);
  }

  async findSongById(id: number): Promise<SongVO> {
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'song', column: 'id', key: 'id', value: id, condition: 'equal' },
    ];
    // 建立查询池
    const builder: SelectQueryBuilder<Song> = this.createBuilderWithWhereOptions(whereOptions);
    const song: Song = await builder.getOne();
    const songVO: SongVO = new SongVO();
    Object.assign(songVO, song);
    return songVO;
  }

  async findSongsByAlbumId(
    albumId: number,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<SongVO>> {
    const albumWhere: Array<BatchWhereOption> = [
      { table: 'album', column: 'id', key: 'id', value: albumId, condition: 'equal' },
    ];
    const builder: SelectQueryBuilder<Song> = this.model.createQueryBuilder('song').leftJoin('song.album', 'album');
    const songSelect: Array<string> = this.getColumns().map((column: string) => `song.${column}`);
    builder.select(songSelect);
    this.builderBatchWhere(builder, albumWhere);
    builder.skip((pageNo - 1) * pageSize);
    builder.take(pageSize);
    const relatedAlbumResult = await builder.getManyAndCount();
    return this.transformPageVO(relatedAlbumResult, pageNo, pageSize);
  }

  async findSongsBySingerId(
    singerId: number,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<SongVO>> {
    const singerWhere: Array<BatchWhereOption> = [
      { table: 'singer', column: 'id', key: 'id', value: singerId, condition: 'equal' },
    ];
    const builder: SelectQueryBuilder<Song> = this.model.createQueryBuilder('song').leftJoin('song.singers', 'singer');
    const songSelect: Array<string> = this.getColumns().map((column: string) => `song.${column}`);
    builder.select(songSelect);
    this.builderBatchWhere(builder, singerWhere);
    builder.skip((pageNo - 1) * pageSize);
    builder.take(pageSize);
    const relatedSingerResult = await builder.getManyAndCount();
    return this.transformPageVO(relatedSingerResult, pageNo, pageSize);
  }
}
