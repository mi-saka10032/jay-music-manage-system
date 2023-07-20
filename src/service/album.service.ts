import { Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
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
    return ['id', 'albumName', 'publishTime', 'coverUrl', 'songs'];
  }

  // 重写page方法，以实现publishTime范围查找
  async page(albumDTO: AlbumDTO, pageNo: number, pageSize: number): Promise<Page<AlbumVO>> {
    Assert.notNull(albumDTO, ErrorCode.UN_ERROR, '查询参数不能为空');
    const where: FindOptionsWhere<Album> = {};
    const { startPublishTime, endPublishTime } = albumDTO;
    this.dateRangeWhere(where, 'publishTime', startPublishTime, endPublishTime);
    return super.page(where, pageNo, pageSize);
  }
}
