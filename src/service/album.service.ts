import { Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Page } from '../common/Page';
import { AlbumDTO } from '../api/dto/AlbumDTO';
import { defaultPageNo, defaultPageSize } from '../decorator/page.decorator';

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

  // 重写page方法，以实现publishTime范围查找
  async queryAlbums(
    albumDTO: AlbumDTO,
    @defaultPageNo() pageNo: number,
    @defaultPageSize() pageSize: number
  ): Promise<Page<AlbumVO>> {
    const where: FindOptionsWhere<Album> = {};
    const { albumName, coverUrl, startPublishTime, endPublishTime } = albumDTO;
    this.dateRangeWhere(where, 'publishTime', startPublishTime, endPublishTime);
    where.albumName = albumName;
    where.coverUrl = coverUrl;
    this.fuzzyWhere(where);
    const select = this.getColumns() as unknown as FindOptionsSelect<Album>;
    const [albumList, total]: [Array<Album>, number] = await this.model.findAndCount({
      select,
      where,
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      relations: ['songs'],
    });
    const albumListVO: Array<AlbumVO> = new Array<AlbumVO>();
    Object.assign(albumListVO, albumList);
    return Page.build(albumListVO, total, pageNo, pageSize);
  }
}
