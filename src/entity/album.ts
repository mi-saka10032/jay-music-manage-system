import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/BaseEntity';
import { ApiProperty } from '@midwayjs/swagger';
import { Song } from './song';

// 专辑表实体类
@Entity('album')
export class Album extends BaseEntity {
  @ApiProperty({ description: '专辑名称' })
  @Column({ length: 100, nullable: true })
  albumName: string;

  @ApiProperty({ description: '发行日期' })
  @Column({ nullable: true })
  publishTime: Date;

  @ApiProperty({ description: '封面图片链接' })
  @Column({ length: 100, nullable: true })
  coverUrl: string;

  // 一张专辑可收录多首歌曲，专辑与歌曲为一对多关系
  @OneToMany(() => Song, (song: Song) => song.album)
  songs: Array<Song>;
}
