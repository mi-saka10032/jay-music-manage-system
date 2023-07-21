import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Song } from '../entity/song';
import { SongVO } from '../api/vo/SongVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AudioFile, AudioFormatOption, NewSongDTO } from '../api/dto/SongDTO';
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

  getColumns(): Array<keyof SongVO> | undefined {
    return undefined;
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
    this.logger.info(JSON.stringify(metadata));
    return metadata;
  }

  private async uploadOSSService(filepath: string, mimeType: string): Promise<string> {
    Assert.isTrue(mimeType === 'audio/mpeg', ErrorCode.UN_ERROR, '上传文件必须是音频格式文件');
    const filename = this.idGenerate.generate();
    const result = await this.ossService.put(`/music/${String(filename)}.mp3`, filepath);
    return result.url;
  }

  async analyzeAudioFile(audioFile: AudioFile): Promise<AudioFormatOption> {
    const { filename, data: filepath, mimeType } = audioFile;
    const [metadata, musicUrl]: [IAudioMetadata, string] = await Promise.all([
      this.analyzeAudioMetadata(filepath),
      this.uploadOSSService(filepath, mimeType),
    ]);
    const audioOption: AudioFormatOption = new AudioFormatOption();
    // 绑定oss的文件url
    audioOption.musicUrl = musicUrl;
    // 已知可返回的信息：歌名、歌曲时长、专辑名、歌手名，其中专辑名和歌手名需要在controller二次查表确认做关联
    audioOption.songName = metadata.common.title ?? ''; // 解析结果歌名title为空则赋空值，下面判断准确度后再默认赋予不带后缀的文件名
    audioOption.album = new NewAlbumDTO();
    audioOption.album.albumName = metadata.common.album ?? ''; // 解析结果专辑名album为空则赋空值，后续二次执行查找
    // 解析结果歌手信息artists为空则赋空数组，后续二次执行查找
    if (metadata.common.artists?.length > 0) {
      audioOption.singers = metadata.common.artists.map((artist: string) => {
        const singer = new NewSingerDTO();
        singer.singerName = artist;
        return singer;
      });
    } else {
      audioOption.singers = [];
    }
    audioOption.duration = Math.round(metadata.format.duration) ?? 0; // 解析结果时长duration为空则赋0
    audioOption.isExact = true;
    // 当上述四个参数中除了album之外（某些单曲可以没有不附带专辑名）其它任意一个参数为空时说明解析结果并不准确，isExact为false
    if (audioOption.songName.length === 0 || audioOption.singers.length === 0 || audioOption.duration === 0) {
      audioOption.isExact = false;
      const lastIndex: number = filename.lastIndexOf('.');
      audioOption.songName = lastIndex > 0 ? filename.substring(0, lastIndex) : filename; // 解析结果不准确 默认取上传文件的不带后缀名的名称
    }
    return audioOption;
  }

  private async queryRelatedAlbum(albumName: string): Promise<Album> {
    // Album存在则先执行查询，如果有查询结果则注入更新用户id并返回，如果无结果则新建Album再返回
    const result: Album = await this.albumService.model.findOne({ where: { albumName }, relations: ['songs'] });
    if (result?.id) {
      this.userService.injectUserid(result);
      return result;
    } else {
      const album: Album = new Album();
      album.albumName = albumName;
      this.userService.injectUserid(album);
      const { id }: AlbumVO = await this.albumService.save(album);
      album.id = id;
      return album;
    }
  }

  private async queryRelatedSingers(singers: Array<NewSingerDTO>): Promise<Array<Singer>> {
    const singerResult: Array<Singer> = [];
    for (const { singerName } of singers) {
      // Singer存在则先执行查询，如果有查询结果则注入更新用户id并返回，如果无结果则新建Singer再返回
      const result: Singer = await this.singerService.model.findOne({ where: { singerName }, relations: ['songs'] });
      if (result?.id) {
        this.userService.injectUserid(result);
        singerResult.push(result);
      } else {
        const singer: Singer = new Singer();
        singer.singerName = singerName;
        this.userService.injectUserid(singer);
        const { id }: SingerVO = await this.singerService.save(singer);
        singer.id = id;
        singerResult.push(singer);
      }
    }
    return singerResult;
  }

  async createSingleSong(newSongDTO: NewSongDTO) {
    const song = new Song();
    const keys = ['songName', 'duration', 'lyric', 'musicUrl', 'publishTime'];
    for (const key of keys) {
      song[key] = newSongDTO[key];
    }
    this.userService.injectUserid(song);
    // 新建单曲数据获取id
    const result: SongVO = await super.save(song);
    song.id = result.id;
    const { album, singers } = newSongDTO;
    // albumName若存在，则查询获取或新建Album获取实体，更新Album与Song关系
    if (album.albumName) {
      const albumResult: Album = await this.queryRelatedAlbum(album.albumName);
      if (albumResult.songs?.length > 0) {
        albumResult.songs.push(song);
      } else {
        albumResult.songs = [song];
      }
      await this.albumService.save(albumResult);
    }
    // singers若存在，查询获取或新建Singer获取实体，更新Singer与Song关系
    if (singers?.length > 0) {
      const singerResult: Array<Singer> = await this.queryRelatedSingers(singers);
      for (const singer of singerResult) {
        if (singer.songs?.length > 0) {
          singer.songs.push(song);
        } else {
          singer.songs = [song];
        }
        await this.singerService.save(singer);
      }
    }
  }
}
