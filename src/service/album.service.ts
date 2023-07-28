import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, BatchWhereOption } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Page } from '../common/Page';
import { AlbumDTO } from '../api/dto/AlbumDTO';
import { defaultPageNo, defaultPageSize } from '../decorator/page.decorator';
import { SongService } from './song.service';

@Provide()
export class AlbumService extends BaseService<Album, AlbumVO> {
  @InjectEntityModel(Album)
  model: Repository<Album>;

  getModel(): Repository<Album> {
    return this.model;
  }

  getVO(): AlbumVO {
    return new AlbumVO();
  }

  getColumns(): Array<keyof AlbumVO> {
    return ['id', 'albumName', 'publishTime', 'coverUrl'];
  }

  @Inject()
  songService: SongService;

  /**
   * @description 建立查询连接池，指定查询列字段，注入查询条件
   * @param whereOptions BatchWhereOption格式的查询条件，依赖父类的builderBatchWhere方法遍历注入
   */
  private createBuilderWithWhereOptions(whereOptions: Array<BatchWhereOption>): SelectQueryBuilder<Album> {
    const builder: SelectQueryBuilder<Album> = this.model
      .createQueryBuilder('album')
      .leftJoinAndSelect('album.songs', 'song');
    const albumSelect: Array<string> = this.getColumns().map((column: string) => `album.${column}`);
    const songSelect: Array<string> = this.songService.getColumns().map((column: string) => `song.${column}`);
    const selectOptions: Array<string> = [...albumSelect, ...songSelect];
    builder.select(selectOptions);
    // 条件注入
    this.builderBatchWhere(builder, whereOptions);
    return builder;
  }

  // 重写page方法，以实现publishTime范围查找
  async queryAlbums(
    albumDTO: AlbumDTO,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<AlbumVO>> {
    const { albumName, startPublishTime, endPublishTime } = albumDTO;
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'album', column: 'albumName', key: 'albumName', value: albumName, condition: 'like' },
      {
        table: 'album',
        column: 'publishTime',
        key: 'startPublishTime',
        value: startPublishTime,
        condition: 'moreThanOrEqual',
      },
      {
        table: 'album',
        column: 'publishTime',
        key: 'endPublishTime',
        value: endPublishTime,
        condition: 'lessThanOrEqual',
      },
    ];
    // 建立查询池，注入多条件查询
    const builder: SelectQueryBuilder<Album> = this.createBuilderWithWhereOptions(whereOptions);
    // offset limit
    builder.skip((pageNo - 1) * pageSize);
    builder.take(pageSize);
    // 查询结果转换
    const [albumList, total]: [Array<Album>, number] = await builder.getManyAndCount();
    const albumListVO: Array<AlbumVO> = new Array<AlbumVO>();
    Object.assign(albumListVO, albumList);
    return Page.build(albumListVO, total, pageNo, pageSize);
  }

  async findAlbumById(id: number): Promise<AlbumVO> {
    const whereOptions: Array<BatchWhereOption> = [
      { table: 'album', column: 'id', key: 'id', value: id, condition: 'equal' },
    ];
    // 建立查询池，注入id条件查询
    const builder: SelectQueryBuilder<Album> = this.createBuilderWithWhereOptions(whereOptions);
    const album: Album = await builder.getOne();
    const albumVO: AlbumVO = new AlbumVO();
    Object.assign(albumVO, album);
    return albumVO;
  }

  async deleteAlbum(id: number) {
    const album: Album = await this.model.findOne({ where: { id }, relations: ['songs'] });
    if (album && album.songs.length > 0) {
      album.songs = [];
      await super.update(album);
    }
    await super.delete(id);
  }
}
