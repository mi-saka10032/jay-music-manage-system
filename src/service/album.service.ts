import { Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Page } from '../common/Page';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { AlbumDTO } from '../api/dto/AlbumDTO';

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

  getColumns(): Array<keyof AlbumVO> | undefined {
    return ['id', 'albumName', 'publishTime', 'coverUrl'];
  }

  // 重写page方法，以实现publishTime范围查找
  async queryAlbums(albumDTO: AlbumDTO, pageNo: number, pageSize: number): Promise<Page<AlbumVO>> {
    const where: FindOptionsWhere<Album> = {};
    const { albumName, coverUrl, startPublishTime, endPublishTime } = albumDTO;
    this.dateRangeWhere(where, 'publishTime', startPublishTime, endPublishTime);
    where.albumName = albumName;
    where.coverUrl = coverUrl;
    const skip = !isNaN(pageNo) ? (pageNo - 1) * pageSize : 0;
    const take = !isNaN(pageSize) ? pageSize : 10;
    Assert.notNull(0 < take && take < 1000, ErrorCode.UN_ERROR, '0 < pageSize < 1000');
    this.fuzzyWhere(where);
    const select = this.getColumns() as unknown as FindOptionsSelect<Album>;
    const [albumList, total]: [Array<Album>, number] = await this.model.findAndCount({
      select,
      where,
      skip,
      take,
      relations: ['songs'],
    });
    const albumListVO: Array<AlbumVO> = new Array<AlbumVO>();
    Object.assign(albumListVO, albumList);
    return Page.build(albumListVO, total, pageNo, pageSize);
  }
}
