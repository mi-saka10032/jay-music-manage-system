// 所有使用Base封装MVC的VO对象都需要继承BaseVO
import { ApiProperty } from '@midwayjs/swagger';

export class BaseVO {
  @ApiProperty({ type: Number, description: 'id' })
  id: number;
}

export class BaseAlbumVO extends BaseVO {
  @ApiProperty({ type: String, description: '专辑名称' })
  albumName: string;

  @ApiProperty({ type: 'Date', description: '发行日期' })
  publishTime: Date | null;

  @ApiProperty({ type: 'Date', description: '封面图片链接' })
  coverUrl: string | null;
}

export class BaseSingerVO extends BaseVO {
  @ApiProperty({ type: String, description: '歌手名称' })
  singerName: string;

  @ApiProperty({ type: String, description: '封面图片链接' })
  coverUrl: string;
}

export class BaseSongVO extends BaseVO {
  @ApiProperty({ type: String, description: '歌曲名称' })
  songName: string;

  @ApiProperty({ type: Number, description: '歌曲时长' })
  duration: number;

  @ApiProperty({ type: String, description: '歌词' })
  lyric: string;

  @ApiProperty({ type: String, description: '播放/下载链接' })
  musicUrl: string;

  @ApiProperty({ type: 'Date', description: '发行日期' })
  publishTime: Date;
}
