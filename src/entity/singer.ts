import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../common/BaseEntity';
import { ApiProperty } from '@midwayjs/swagger';
import { Song } from './song';

// 歌手表实体类
@Entity('singer')
export class Singer extends BaseEntity {
  @ApiProperty({ description: '歌手名' })
  @Column({ length: 100, unique: true })
  singerName: string;

  // 歌手与歌曲多对多关系，且歌手为关系拥有者
  @ManyToMany(() => Song, (song: Song) => song.singers)
  @JoinTable()
  songs: Array<Song>;
}
