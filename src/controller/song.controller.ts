import { ApiBearerAuth, ApiTags } from '@midwayjs/swagger';
import { Controller, Files, Inject, Post } from '@midwayjs/decorator';
import { BaseController } from '../common/BaseController';
import { Song } from '../entity/song';
import { SongVO } from '../api/vo/SongVO';
import { Context } from '@midwayjs/koa';
import { SongService } from '../service/song.service';
import { BaseService } from '../common/BaseService';
import { ILogger } from '@midwayjs/core';
import { AudioFile, AudioFormatOption } from '../api/dto/SongDTO';
import { AxiosService } from '../service/axios.service';
import { LyricResponse, SingleSong, SingleSongsResponse } from '../common/NeteaseAPIType';

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
  axiosService: AxiosService;

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
    const audioFormatOptions: Array<AudioFormatOption> = await this.songService.analyzeAudioFiles(audioFiles);
    return Promise.all(
      audioFormatOptions.map(async (audioFormatOption: AudioFormatOption): Promise<AudioFormatOption> => {
        const { isExact, songName, singers } = audioFormatOption;
        const singerName: string = singers[0];
        if (isExact) {
          // 首次调用axiosService，根据关键词查询单曲信息
          const keywords: string = songName + '-' + singerName;
          const response: SingleSongsResponse = await this.axiosService.getMusicsWithKeywords(keywords);
          // 遍历歌曲信息，过滤查找第一个符合条件的歌曲对象
          const songs: Array<SingleSong> = response.result.songs;
          for (let i = 0; i < songs.length; i++) {
            const singleSong: SingleSong = songs[i];
            const curSongName: string = singleSong.name;
            const curSingerName: string = singleSong.ar[0].name;
            // 歌曲名称和歌手名称均匹配，返回该歌曲的id，否则继续遍历查找
            if (songName === curSongName && singerName === curSingerName) {
              audioFormatOption.id = singleSong.id;
              audioFormatOption.album = singleSong.al.name ?? '';
              break;
            }
          }
          // 判断id以二次调用axiosService，查找歌词
          if (audioFormatOption.id) {
            const response: LyricResponse = await this.axiosService.getLyricWithId(audioFormatOption.id);
            audioFormatOption.lyric = response.lrc.lyric;
          }
        }
        return audioFormatOption;
      })
    );
  }
}
