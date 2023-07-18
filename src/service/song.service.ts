import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Song } from '../entity/song';
import { SongVO } from '../api/vo/SongVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AudioFile, AudioFormatOption } from '../api/dto/SongDTO';
import { createReadStream, ReadStream } from 'fs';
import { IAudioMetadata, parseNodeStream } from 'music-metadata-browser';
import { ILogger } from '@midwayjs/core';

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

  async analyzeAudioFiles(audioFiles: Array<AudioFile>): Promise<Array<AudioFormatOption>> {
    return Promise.all(
      audioFiles.map(async audioFile => {
        const { filename, data } = audioFile;
        const stream: ReadStream = createReadStream(data);
        // MusicMetadata自带解析Stream完成后关闭Stream，无需手动关闭ReadStream
        const metadata: IAudioMetadata = await parseNodeStream(stream);
        this.logger.info(JSON.stringify(metadata));
        // 已知可返回的信息：歌名、歌曲时长、专辑名、歌手名，其中专辑名和歌手名需要在controller二次查表确认做关联
        const audioOption: AudioFormatOption = new AudioFormatOption();
        audioOption.songName = metadata.common.title ?? ''; // 解析结果歌名title为空则赋空值，下面判断准确度后再默认赋予不带后缀的文件名
        audioOption.album = metadata.common.album ?? ''; // 解析结果专辑名album为空则赋空值，后续二次执行查找
        audioOption.singers = metadata.common.artists ?? []; // 解析结果歌手信息artists为空则赋空数组，后续二次执行查找
        audioOption.duration = Math.round(metadata.format.duration) ?? 0; // 解析结果时长duration为空则赋0
        audioOption.isExact = true;
        // 当上述四个参数中除了album之外（某些单曲可以没有不附带专辑名）其它任意一个参数为空时说明解析结果并不准确，isExact为false
        if (audioOption.songName.length === 0 || audioOption.singers.length === 0 || audioOption.duration === 0) {
          audioOption.isExact = false;
          const lastIndex: number = filename.lastIndexOf('.');
          audioOption.songName = lastIndex > 0 ? filename.substring(0, lastIndex) : filename; // 解析结果不准确 默认取上传文件的不带后缀名的名称
        }
        return audioOption;
      })
    );
  }
}
