import { Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn, ValueTransformer } from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';

// 用于处理和转换typeORM在返回主键数据时自动将bigint类型转换为string类型，导致前端总是获取string类型而非number类型数据的问题
class BigIntTransformer implements ValueTransformer {
  to(value: bigint | null): string | null {
    return value != null ? value.toString() : null;
  }
  from(value: string | null): number | null {
    return value != null ? parseInt(value) : null;
  }
}

// 所有使用Base封装MVC的Entity实体类都需要继承BaseEntity
export class BaseEntity {
  @PrimaryColumn({ type: 'bigint', transformer: new BigIntTransformer() })
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
