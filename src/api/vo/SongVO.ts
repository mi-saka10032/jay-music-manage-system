import { BaseVO } from './BaseVO';
import { ApiProperty } from '@midwayjs/swagger';
import { SingerVO } from './SingerVO';

export class SongVO extends BaseVO {
  @ApiProperty({ example: '七里香', description: '歌曲名称' })
  songName: string;

  @ApiProperty({ example: 100, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ example: '[0:0:0] 第一句歌词', description: '歌词' })
  lyric: string;

  @ApiProperty({ example: 'https://xxx.xxx', description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ example: '七里香', description: '专辑名' })
  album: string;

  @ApiProperty({ example: [{ singerName: '周杰伦' }], description: '专辑名' })
  singers: Array<SingerVO>;
}
