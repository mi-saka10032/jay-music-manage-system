import {
  Between,
  FindOptionsSelect,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Inject } from '@midwayjs/decorator';
import { SnowflakeIdGenerate } from '../utils/Snowflake';
import { BaseEntity } from './BaseEntity';
import { BaseVO } from '../music-api/vo/BaseVO';
import { Page } from './Page';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { ILogger } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { defaultPageNo, defaultPageSize } from '../decorator/page.decorator';

export interface BatchWhereOption {
  table: string;
  column: string;
  key: string;
  value: any | null;
  condition: 'equal' | 'like' | 'moreThan' | 'lessThan' | 'moreThanOrEqual' | 'lessThanOrEqual';
}

/**
 * SERVICE的基类
 */
export abstract class BaseService<T extends BaseEntity, V extends BaseVO> {
  @Inject()
  idGenerate: SnowflakeIdGenerate;

  @Inject()
  logger: ILogger;

  @Inject()
  ctx: Context;

  // 获取实体库
  abstract getModel(): Repository<T>;

  // 获取VO对象
  abstract getVO(): V;

  // 获取VO对象指定查询列字段 不提供Array 默认为where提供undefined全量查询
  abstract getColumns(): Array<keyof V>;

  /**
   * @description 字符串全模糊匹配查询 为typeORM的快捷API(find系列)补全where对象
   * @param where typeORM的条件对象
   */
  public fuzzyWhere(where: FindOptionsWhere<T>) {
    for (const whereKey in where) {
      const option = where[whereKey];
      if (typeof option === 'string') {
        where[String(whereKey)] = ILike(`%${option}%`);
      }
    }
  }

  /**
   * @description 日期范围条件匹配查询 为typeORM的快捷API(find系列)补全where对象
   * @param where
   * @param whereKey Entity的键值名
   * @param startDate 起始日期
   * @param endDate 结束日期
   */
  public dateRangeWhere(where: FindOptionsWhere<T>, whereKey: keyof T, startDate: Date | null, endDate: Date | null) {
    const left: number = startDate ? 0b0010 : 0b0000;
    const right: number = endDate ? 0b0001 : 0b0000;
    const range: number = left | right;
    // range的结果有4种(3|2|1|0)，分别代表不同的SQL语句
    switch (range) {
      case 3: {
        where[String(whereKey)] = Between(startDate, endDate);
        break;
      }
      case 2: {
        where[String(whereKey)] = MoreThanOrEqual(startDate);
        break;
      }
      case 1: {
        where[String(whereKey)] = LessThanOrEqual(endDate);
        break;
      }
      default: {
        where[String(whereKey)] = undefined;
      }
    }
  }

  /**
   * @description createQueryBuilder模式下批量where条件的插值方法 typeORM的createQueryBuilder模式专用
   * @param builder createQueryBuilder返回值
   * @param whereOptions Array<{ table:表名, column:列名, value:列值(可能为空), condition:多条件判断 }>
   */
  public builderBatchWhere(builder: SelectQueryBuilder<T>, whereOptions: Array<BatchWhereOption>) {
    for (const option of whereOptions) {
      const { table, column, key, value, condition } = option;
      if (value != null) {
        switch (condition) {
          case 'equal': {
            builder.andWhere(`${table}.${column} = :${key}`, { [key]: value });
            break;
          }
          case 'like': {
            builder.andWhere(`${table}.${column} LIKE :${key}`, { [key]: `%${value}%` });
            break;
          }
          case 'lessThan': {
            builder.andWhere(`${table}.${column} < :${key}`, { [key]: value });
            break;
          }
          case 'lessThanOrEqual': {
            builder.andWhere(`${table}.${column} <= :${key}`, { [key]: value });
            break;
          }
          case 'moreThan': {
            builder.andWhere(`${table}.${column} > :${key}`, { [key]: value });
            break;
          }
          case 'moreThanOrEqual': {
            builder.andWhere(`${table}.${column} >= :${key}`, { [key]: value });
            break;
          }
        }
      }
    }
  }

  /**
   * @description 新增或更新指定对象数据 private内部使用
   * @param o 待新增or更新的对象 model统一使用save执行
   */
  private async save(o: T): Promise<V> {
    o.updaterId = this.ctx.userContext.userId;
    const result: T = await this.getModel().save(o);
    const resultVO: V = this.getVO();
    return Object.assign(resultVO, result);
  }

  /**
   * @description 新建数据
   * @param o o.id必须为空
   */
  public async create(o: T): Promise<V> {
    o.id = this.idGenerate.generate();
    o.createrId = this.ctx.userContext.userId;
    return this.save(o);
  }

  /**
   * @description 更新数据
   * @param o o.id不能为空
   */
  public async update(o: T): Promise<V> {
    return this.save(o);
  }

  // 根据id删除指定对象
  public async delete(id: number): Promise<void> {
    await this.getModel().delete(id);
  }

  /**
   * @description 根据id查询指定对象
   * @param id
   */
  public async findById(id: number): Promise<V> {
    const select = this.getColumns() as unknown as FindOptionsSelect<T>;
    const where = { id } as FindOptionsWhere<T>;
    const result: T = await this.getModel().findOne({ select, where });
    const resultVO: V = this.getVO();
    return Object.assign(resultVO, result);
  }

  /**
   * @description 根据多个id查询对象列表
   * @param ids
   */
  public async findByIds(ids: number[]): Promise<V[]> {
    // 指定VO字段查询列
    const select = this.getColumns() as unknown as FindOptionsSelect<T>;
    const where = { id: In(ids) } as FindOptionsWhere<T>;
    const list: T[] = await this.getModel().find({ select, where });
    const listVO: V[] = new Array<V>();
    return Object.assign(listVO, list);
  }

  /**
   * @description 分页模糊查询
   * @param where 筛选条件，string类型默认全模糊(%s%)匹配
   * @param pageNo 去除非空校验，默认取1
   * @param pageSize 去除非空校验，默认取10
   */
  public async page(
    where: FindOptionsWhere<T>,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<V>> {
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;
    // 字符串模糊匹配
    this.fuzzyWhere(where);
    // 指定VO字段查询列
    const select = this.getColumns() as unknown as FindOptionsSelect<T>;
    const [list, total]: [T[], number] = await this.getModel().findAndCount({ select, where, skip, take });
    const listVO: V[] = new Array<V>();
    Object.assign(listVO, list);
    return Page.build(listVO, total, pageNo, pageSize);
  }

  /**
   * @description 根据部分对象内部属性查询指定对象
   * @param where 筛选条件，string类型默认全模糊(%s%)匹配
   */
  public async findOne(where: FindOptionsWhere<T>): Promise<V> {
    // 字符串模糊匹配
    this.fuzzyWhere(where);
    // 指定VO字段查询列
    const select = this.getColumns() as unknown as FindOptionsSelect<T>;
    const result: T = await this.getModel().findOne({ select, where });
    const resultVO: V = this.getVO();
    return Object.assign(resultVO, result);
  }
}
