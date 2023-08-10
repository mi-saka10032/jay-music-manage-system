import { BaseService } from './BaseService';
import { BaseEntity } from './BaseEntity';
import { BaseVO } from '../music-api/vo/BaseVO';
import { Body, Post, Query } from '@midwayjs/decorator';
import { ApiResponse } from '@midwayjs/swagger';
import { Page } from './Page';
import { Assert } from './Assert';

/**
 * Controller基础类，由于类继承不支持装饰类@Post、@Query、@Body等，
 * 所以这里的装饰类不生效，否则实现类就不需要再写多余代码了，
 * 这里保留在这里，以备以后可能会支持继承的装饰类
 */
export abstract class BaseController<T extends BaseEntity, V extends BaseVO> {
  abstract getService(): BaseService<T, V>;

  @Post('/create')
  async create(@Body() body: T): Promise<V> {
    Assert.baseAssert_CreateObj(body);
    Assert.baseAssert_CreateId(body.id);
    return this.getService().create(body);
  }

  @Post('/delete')
  async delete(@Query('id') id: number): Promise<boolean> {
    Assert.baseAssert_DeleteId(id);
    await this.getService().delete(id);
    return true;
  }

  @Post('/update')
  async update(@Body() body: T): Promise<V> {
    Assert.baseAssert_UpdateObj(body);
    Assert.baseAssert_UpdateId(body.id);
    return this.getService().update(body);
  }

  @Post('/findById')
  async findById(@Query('id') id: number): Promise<V> {
    Assert.baseAssert_FindId(id);
    return this.getService().findById(id);
  }

  @ApiResponse({ description: '通过一批主键查找' })
  @Post('/findByIds')
  async findByIds(@Query('ids') ids: number[]): Promise<V[]> {
    Assert.baseAssert_FindIds(ids);
    return this.getService().findByIds(ids);
  }

  @ApiResponse({ description: '分页查询' })
  @Post('/page')
  async page(@Body() map: Map<string, any>): Promise<Page<V>> {
    Assert.baseAssert_QueryPage(map);
    const pageNo = map.get('pageNo');
    const pageSize = map.get('pageSize');
    map.delete('pageNo');
    map.delete('pageSize');
    const where = {};
    map.forEach((value, key) => (where[key] = value));
    return this.getService().page(where, pageNo, pageSize);
  }

  @Post('/findOne')
  async findOne(@Body() body: T): Promise<V> {
    Assert.baseAssert_QueryOne(body);
    const where = {};
    Object.keys(body).forEach(key => {
      where[key] = body[key];
    });
    return this.getService().findOne(where);
  }
}
