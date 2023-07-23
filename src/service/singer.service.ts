import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Singer } from '../entity/singer';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService, BatchWhereOption } from '../common/BaseService';
import { SingerVO } from '../api/vo/SingerVO';
import { SingerDTO } from '../api/dto/SingerDTO';
import { Page } from '../common/Page';
import { SongService } from './song.service';

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
   * @description Singer的指定列查询：指定Singer和其LeftJoin的Song的字段
   * @param builder
   */
  private specifyJoinColumns(builder: SelectQueryBuilder<Singer>) {
    const singerSelect: Array<string> = this.getColumns().map((column: string) => `singer.${column}`);
    const songSelect: Array<string> = this.songService.getColumns().map((column: string) => `song.${column}`);
    const selectOptions: Array<string> = [...singerSelect, ...songSelect];
    builder.select(selectOptions);
  }

  async querySinger(singerDTO: SingerDTO, pageNo: number, pageSize: number): Promise<Page<SingerVO>> {
    const { singerName, coverUrl } = singerDTO;
    const skip = !isNaN(pageNo) ? (pageNo - 1) * pageSize : 0;
    const take = !isNaN(pageSize) ? pageSize : 10;
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'singer', column: 'singerName', value: singerName, condition: 'like' },
      { table: 'singer', column: 'coverUrl', value: coverUrl, condition: 'like' },
    ];
    const builder: SelectQueryBuilder<Singer> = this.model
      .createQueryBuilder('singer')
      .leftJoinAndSelect('singer.songs', 'song');
    // 指定列查询
    this.specifyJoinColumns(builder);
    // 条件注入
    this.builderBatchWhere(builder, whereOptions);
    // offset limit
    builder.skip(skip);
    builder.take(take);
    // 查询结果转换
    const [singerList, total]: [Array<Singer>, number] = await builder.getManyAndCount();
    const singerListVO: Array<SingerVO> = new Array<SingerVO>();
    Object.assign(singerListVO, singerList);
    return Page.build(singerListVO, total, pageNo, pageSize);
  }

  async findSingerById(id: number): Promise<SingerVO> {
    const whereOptions: Array<BatchWhereOption> = [{ table: 'singer', column: 'id', value: id, condition: 'equal' }];
    const builder: SelectQueryBuilder<Singer> = this.model
      .createQueryBuilder('singer')
      .leftJoinAndSelect('singer.songs', 'song');
    // 指定列查询
    this.specifyJoinColumns(builder);
    // id条件注入
    this.builderBatchWhere(builder, whereOptions);
    const singer: Singer = await builder.getOne();
    const singerVO = new SingerVO();
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
