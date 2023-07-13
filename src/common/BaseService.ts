import { ILike, In, Repository } from 'typeorm';
import { Inject } from '@midwayjs/decorator';
import { SnowflakeIdGenerate } from '../utils/Snowflake';
import { BaseEntity, BaseVO } from './BaseEntity';
import { Page } from './Page';
import { Assert } from './Assert';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { ErrorCode } from './ErrorCode';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';

/**
 * SERVICE的基类
 */
export abstract class BaseService<T extends BaseEntity, V extends BaseVO> {
  @Inject()
  idGenerate: SnowflakeIdGenerate;

  // 获取实体库
  abstract getModel(): Repository<T>;

  // 获取VO对象
  abstract getVO(): V;

  // 获取VO对象指定查询列字段
  abstract getColumns(): string[] | undefined;

  fuzzyWhere(where: FindOptionsWhere<T>) {
    // 字符串全模糊匹配查询
    for (const whereKey in where) {
      const option = where[whereKey];
      if (typeof option === 'string') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        where[whereKey] = ILike(`%${option}%`);
      }
    }
  }

  // 新增或更新指定对象数据
  async save(o: T): Promise<V> {
    Assert.notNull(o, ErrorCode.UN_ERROR, '被保存的对象不能为空');
    if (!o.id) o.id = this.idGenerate.generate();
    const result: T = await this.getModel().save(o);
    const resultVO: V = this.getVO();
    return Object.assign(resultVO, result);
  }

  // 根据id删除指定对象
  async delete(id: number): Promise<void> {
    Assert.notNull(id, ErrorCode.UN_ERROR, '删除对象时，ID不能为空');
    await this.getModel().delete(id);
  }

  /**
   * @description 根据id查询指定对象
   * @param id
   */
  async findById(id: number): Promise<V> {
    Assert.notNull(id, ErrorCode.UN_ERROR, '查询对象时，ID不能为空');
    const select = this.getColumns();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result: T = await this.getModel().findOne({ select, where: { id } });
    const resultVO: V = this.getVO();
    return Object.assign(resultVO, result);
  }

  /**
   * @description 根据多个id查询对象列表
   * @param ids
   */
  async findByIds(ids: number[]): Promise<V[]> {
    Assert.notNull(ids, ErrorCode.UN_ERROR, '查询对象时，IDS不能为空');
    // 指定VO字段查询列
    const select = this.getColumns();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const list: T[] = await this.getModel().find({ select, where: { id: In(ids) } });
    const listVO: V[] = new Array<V>();
    return Object.assign(listVO, list);
  }

  /**
   * @description 分页模糊查询
   * @param where 筛选条件，string类型默认全模糊(%s%)匹配
   * @param pageNo 去除非空校验，默认取1
   * @param pageSize 去除非空校验，默认取10
   */
  async page(where: FindOptionsWhere<T>, pageNo: number, pageSize: number): Promise<Page<V>> {
    Assert.notNull(where, ErrorCode.UN_ERROR, '查询参数不能为空');
    // Assert.notNull(pageNo != null && pageNo > 0, ErrorCode.UN_ERROR, 'pageNo不能为空');
    // Assert.notNull(pageSize != null && pageSize > 0, ErrorCode.UN_ERROR, 'pageSize不能为空');
    const skip = !isNaN(pageNo) ? (pageNo - 1) * pageSize : 0;
    const take = !isNaN(pageSize) ? pageSize : 10;
    Assert.notNull(0 < take && take < 1000, ErrorCode.UN_ERROR, '0 < pageSize < 1000');
    // 创建时间降序
    const order = { createTime: 'desc' } as FindOptionsOrder<T>;
    // 字符串模糊匹配
    this.fuzzyWhere(where);
    // 指定VO字段查询列
    const select = this.getColumns();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [list, total]: [T[], number] = await this.getModel().findAndCount({ select, where, order, skip, take });
    const listVO: V[] = new Array<V>();
    Object.assign(listVO, list);
    return Page.build(listVO, total, pageNo, pageSize);
  }

  /**
   * @description 根据部分对象内部属性查询指定对象
   * @param where 筛选条件，string类型默认全模糊(%s%)匹配
   */
  async findOne(where: FindOptionsWhere<T>): Promise<V> {
    Assert.notNull(where, ErrorCode.UN_ERROR, '单个查询时，对象不能为空');
    // 字符串模糊匹配
    this.fuzzyWhere(where);
    // 指定VO字段查询列
    const select = this.getColumns();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result: T = await this.getModel().findOne({ select, where });
    const resultVO: V = this.getVO();
    return Object.assign(resultVO, result);
  }
}
