import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Singer } from '../entity/singer';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService, BatchWhereOption } from '../common/BaseService';
import { SingerVO } from '../api/vo/SingerVO';
import { SingerDTO } from '../api/dto/SingerDTO';
import { Page } from '../common/Page';
import { SongService } from './song.service';
import { defaultPageNo, defaultPageSize } from '../decorator/page.decorator';

@Provide()
export class SingerService extends BaseService<Singer, SingerVO> {
  @InjectEntityModel(Singer)
  model: Repository<Singer>;

  getModel(): Repository<Singer> {
    return this.model;
  }

  getVO(): SingerVO {
    return new SingerVO();
  }

  getColumns(): Array<keyof SingerVO> {
    return ['id', 'singerName', 'coverUrl'];
  }

  @Inject()
  songService: SongService;

  /**
   * @description 建立查询连接池，指定查询列字段，注入查询条件
   * @param whereOptions BatchWhereOption格式的查询条件，依赖父类的builderBatchWhere方法遍历注入
   */
  private createBuilderWithWhereOptions(whereOptions: Array<BatchWhereOption>): SelectQueryBuilder<Singer> {
    const builder: SelectQueryBuilder<Singer> = this.model
      .createQueryBuilder('singer')
      .leftJoinAndSelect('singer.songs', 'song');
    const singerSelect: Array<string> = this.getColumns().map((column: string) => `singer.${column}`);
    const songSelect: Array<string> = this.songService.getColumns().map((column: string) => `song.${column}`);
    const selectOptions: Array<string> = [...singerSelect, ...songSelect];
    builder.select(selectOptions);
    // 条件注入
    this.builderBatchWhere(builder, whereOptions);
    return builder;
  }

  async querySinger(
    singerDTO: SingerDTO,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<SingerVO>> {
    const { singerName, coverUrl } = singerDTO;
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'singer', column: 'singerName', key: 'singerName', value: singerName, condition: 'like' },
      { table: 'singer', column: 'coverUrl', key: 'coverUrl', value: coverUrl, condition: 'like' },
    ];
    // 建立查询池，注入多条件查询
    const builder: SelectQueryBuilder<Singer> = this.createBuilderWithWhereOptions(whereOptions);
    // offset limit
    builder.skip((pageNo - 1) * pageSize);
    builder.take(pageSize);
    // 查询结果转换
    const [singerList, total]: [Array<Singer>, number] = await builder.getManyAndCount();
    const singerListVO: Array<SingerVO> = new Array<SingerVO>();
    Object.assign(singerListVO, singerList);
    return Page.build(singerListVO, total, pageNo, pageSize);
  }

  async findSingerById(id: number): Promise<SingerVO> {
    const whereOptions: Array<BatchWhereOption> = [{ table: 'singer', column: 'id', key: 'id', value: id, condition: 'equal' }];
    // 建立查询池，注入id条件查询
    const builder: SelectQueryBuilder<Singer> = this.createBuilderWithWhereOptions(whereOptions);
    const singer: Singer = await builder.getOne();
    const singerVO: SingerVO = new SingerVO();
    Object.assign(singerVO, singer);
    return singerVO;
  }

  async deleteSinger(id: number) {
    const singer: Singer = await this.model.findOne({ where: { id }, relations: ['songs'] });
    if (singer && singer.songs.length > 0) {
      singer.songs = [];
      await super.update(singer);
    }
    await super.delete(id);
  }
}
