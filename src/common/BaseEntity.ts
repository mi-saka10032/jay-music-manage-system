import { Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';

// 所有使用Base封装MVC的Entity实体类都需要继承BaseEntity
export class BaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: '更新人ID' })
  @Column({ type: 'bigint' })
  updaterId: number;

  @ApiProperty({ description: '创建人ID' })
  @Column({ type: 'bigint' })
  createrId: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updateTime: Date;
}

// 所有使用Base封装MVC的VO对象都需要继承BaseVO
export class BaseVO extends BaseEntity {}
