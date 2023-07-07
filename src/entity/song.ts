import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';
import { BaseEntity } from '../common/BaseEntity';
import { ApiProperty } from '@midwayjs/swagger';
import { Album } from './album';
import { Singer } from './singer';

// 歌曲表实体类
@Entity('song')
export class Song extends BaseEntity {
  @ApiProperty({ description: '歌曲名称' })
  @Column({ length: 100 })
  songName: string;

  @ApiProperty({ description: '歌手/乐队名称' })
  @Column({ length: 100 })
  artistName: string;

  @ApiProperty({ description: '歌曲时长' })
  @Column({ type: 'int' })
  duration: number;

  @ApiProperty({ description: '歌词' })
  @Column({ type: 'text', nullable: true })
  lyric: string;

  @ApiProperty({ description: '播放/下载链接' })
  @Column({ length: 100 })
  musicUrl: string;

  // 多首歌曲可收录于一张专辑内，歌曲与专辑为多对一关系
  @ManyToOne(() => Album, (album: Album) => album.songs)
  album: Album;

  // 歌曲与歌手多对多关系
  @ManyToMany(() => Singer, (singer: Singer) => singer.songs)
  singers: Array<Singer>;
}
