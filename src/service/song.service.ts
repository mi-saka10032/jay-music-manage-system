import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, BatchWhereOption } from '../common/BaseService';
import { Song } from '../entity/song';
import { SongVO } from '../api/vo/SongVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AudioFile, AudioFormatOption, NewSongDTO, SongDTO, UpdateSongDTO } from '../api/dto/SongDTO';
import { createReadStream, ReadStream } from 'fs';
import { IAudioMetadata, parseNodeStream } from 'music-metadata-browser';
import { ILogger } from '@midwayjs/core';
import { OSSService } from '@midwayjs/oss';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { SnowflakeIdGenerate } from '../utils/Snowflake';
import { AlbumService } from './album.service';
import { SingerService } from './singer.service';
import { Album } from '../entity/album';
import { UserService } from './user.service';
import { Singer } from '../entity/singer';
import { SingerVO } from '../api/vo/SingerVO';
import { AlbumVO } from '../api/vo/AlbumVO';
import { NewAlbumDTO } from '../api/dto/AlbumDTO';
import { NewSingerDTO } from '../api/dto/SingerDTO';
import { Page } from '../common/Page';

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
  ossService: OSSService;

  @Inject()
  idGenerate: SnowflakeIdGenerate;

  @Inject()
  albumService: AlbumService;

  @Inject()
  singerService: SingerService;

  @Inject()
  userService: UserService;

  /**
   * @description 解析音频文件的相关信息
   * @param filepath upload组件将上传的文件做成了临时文件目录的模式，因此使用filepath即可获得相应文件路径
   */
  private async analyzeAudioMetadata(filepath: string): Promise<IAudioMetadata> {
    const stream: ReadStream = createReadStream(filepath);
    // MusicMetadata自带解析Stream完成后关闭Stream，无需手动关闭ReadStream
    const metadata: IAudioMetadata = await parseNodeStream(stream);
    this.logger.info('AudioMetadata %j', JSON.stringify(metadata));
    return metadata;
  }

  /**
   * @description 上传OSS服务
   * @param filepath upload组件将上传的文件做成了临时文件目录的模式，因此使用filepath即可获得相应文件路径
   * @private
   */
  private async uploadOSSService(filepath: string): Promise<string> {
    const filename = this.idGenerate.generate();
    this.logger.info('startUploadOSS');
    const result = await this.ossService.put(`/music/${String(filename)}.mp3`, filepath);
    this.logger.info('OSSResult %j', JSON.stringify(result));
    return result.url;
  }

  /**
   * @description 分析音频文件
   * 1. 解析音频结果
   * 2. 上传OSS服务
   * 3. 返回最终分析结果
   * @param audioFile upload组件接收上传文件处理形成的格式
   */
  async analyzeAudioFile(audioFile: AudioFile): Promise<AudioFormatOption> {
    const { filename, data: filepath } = audioFile;
    const [metadata, musicUrl]: [IAudioMetadata, string] = await Promise.all([
      this.analyzeAudioMetadata(filepath),
      this.uploadOSSService(filepath),
    ]);
    const audioOption: AudioFormatOption = new AudioFormatOption();
    // 绑定oss的文件url
    audioOption.musicUrl = musicUrl;
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
   * @description 查询并新增关联的Album专辑数据 新增歌曲方法时独有功能，意为新增歌曲时附带新增尚未添加的Album
   * @param albumDTO NewAlbumDTO
   */
  private async queryAndCreateRelatedAlbum(albumDTO: NewAlbumDTO): Promise<Album> {
    const { albumName, coverUrl, publishTime } = albumDTO;
    // Album存在则先执行查询，如果有查询结果则注入更新用户id并返回，如果无结果则新建Album再返回
    const result: Album = await this.albumService.model.findOne({ where: { albumName }, relations: ['songs'] });
    if (result?.id) {
      return result;
    } else {
      const album: Album = new Album();
      album.albumName = albumName;
      album.coverUrl = coverUrl;
      album.publishTime = publishTime;
      const { id }: AlbumVO = await this.albumService.create(album);
      album.id = id;
      return album;
    }
  }

  /**
   * @description 查询并新增关联的Singer歌手数据 新增歌曲方法时独有功能，意为新增歌曲时附带新增尚未添加的Singer
   * @param singer NewSingerDTO
   */
  private async queryAndCreateRelatedSinger(singer: NewSingerDTO): Promise<Singer> {
    const { singerName, coverUrl } = singer;
    // Singer存在则先执行查询，如果有查询结果则注入更新用户id并返回，如果无结果则新建Singer再返回
    const result: Singer = await this.singerService.model.findOne({ where: { singerName }, relations: ['songs'] });
    if (result?.id) {
      return result;
    } else {
      const singer: Singer = new Singer();
      singer.singerName = singerName;
      singer.coverUrl = coverUrl;
      const { id }: SingerVO = await this.singerService.create(singer);
      singer.id = id;
      return singer;
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
    const { album, singer } = newSongDTO;
    // albumName若存在，则查询获取或新建Album获取实体，更新Album与Song关系
    if (album.albumName?.length > 0) {
      const albumResult: Album = await this.queryAndCreateRelatedAlbum(album);
      if (albumResult.songs?.length > 0) {
        albumResult.songs.push(song);
      } else {
        albumResult.songs = [song];
      }
      const albumVO: AlbumVO = await this.albumService.update(albumResult);
      // 去除多余的songs属性
      delete albumVO.songs;
      result.album = albumVO;
    }
    // singers若存在，查询获取或新建Singer获取实体，更新Singer与Song关系
    if (singer.singerName?.length > 0) {
      const singerResult: Singer = await this.queryAndCreateRelatedSinger(singer);
      if (singerResult.songs?.length > 0) {
        singerResult.songs.push(song);
      } else {
        singerResult.songs = [song];
      }
      const singerVO: SingerVO = await this.singerService.update(singerResult);
      // 去除多余的songs属性
      delete singerVO.songs;
      result.singers = [singerVO];
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
   * @description 歌曲分页查询 涉及到联表操作
   * @param songDTO SongDTO
   * @param pageNo number
   * @param pageSize number
   */
  async querySongs(songDTO: SongDTO, pageNo: number, pageSize: number): Promise<Page<SongVO>> {
    const { songName, lyric, albumName, singerName, startPublishTime, endPublishTime } = songDTO;
    const skip = !isNaN(pageNo) ? (pageNo - 1) * pageSize : 0;
    const take = !isNaN(pageSize) ? pageSize : 10;
    Assert.notNull(0 < take && take < 1000, ErrorCode.UN_ERROR, '0 < pageSize < 1000');
    // 设置查询条件
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'song', column: 'songName', value: songName, condition: 'like' },
      { table: 'song', column: 'lyric', value: lyric, condition: 'like' },
      { table: 'song', column: 'publishTime', value: startPublishTime, condition: 'moreThanOrEqual' },
      { table: 'song', column: 'publishTime', value: endPublishTime, condition: 'lessThanOrEqual' },
      { table: 'album', column: 'albumName', value: albumName, condition: 'like' },
      { table: 'singer', column: 'singerName', value: singerName, condition: 'like' },
    ];
    // 建立查询池、指定列查询、where条件注入
    const builder: SelectQueryBuilder<Song> = this.createBuilderWithWhereOptions(whereOptions);
    // offset limit
    builder.skip(skip);
    builder.take(take);
    // 查询结果转换
    const [songList, total]: [Array<Song>, number] = await builder.getManyAndCount();
    const songListVO: Array<SongVO> = new Array<SongVO>();
    Object.assign(songListVO, songList);
    return Page.build(songListVO, total, pageNo, pageSize);
  }

  /**
   * @description 歌曲更新 涉及联表 relations
   * @param updateSongDTO UpdateSongDTO
   */
  async updateSong(updateSongDTO: UpdateSongDTO): Promise<UpdateSongDTO> {
    Assert.notNull(updateSongDTO.id, ErrorCode.UN_ERROR, 'song.id不能为空');
    const song: Song = new Song();
    const keys: Array<string> = ['id', 'songName', 'duration', 'lyric', 'musicUrl', 'publishTime'];
    for (const key of keys) {
      song[key] = updateSongDTO[key];
    }
    const { albumId, singerId } = updateSongDTO;
    if (albumId) {
      const album: Album = await this.albumService.model.findOne({ where: { id: albumId }, relations: ['songs'] });
      if (album?.id) {
        album.songs.push(song);
        await this.albumService.update(album);
      }
    }
    if (singerId) {
      const singer: Singer = await this.singerService.model.findOne({ where: { id: singerId }, relations: ['songs'] });
      if (singer?.id) {
        singer.songs.push(song);
        await this.singerService.update(singer);
      }
    }
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
    const whereOptions: Array<BatchWhereOption> = [{ table: 'song', column: 'id', value: id, condition: 'equal' }];
    // 建立查询池
    const builder: SelectQueryBuilder<Song> = this.createBuilderWithWhereOptions(whereOptions);
    const song: Song = await builder.getOne();
    const songVO: SongVO = new SongVO();
    Object.assign(songVO, song);
    return songVO;
  }
}
