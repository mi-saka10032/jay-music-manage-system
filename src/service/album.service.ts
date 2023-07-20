import { Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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
    const start = startPublishTime ? 0b0010 : 0b0000;
    const end = endPublishTime ? 0b0001 : 0b0000;
    const range = start | end;
    switch (range) {
      case 3: {
        where.publishTime = Between(new Date(startPublishTime), new Date(endPublishTime));
        break;
      }
      case 2: {
        where.publishTime = MoreThanOrEqual(new Date(startPublishTime));
        break;
      }
      case 1: {
        where.publishTime = LessThanOrEqual(new Date(endPublishTime));
        break;
      }
      default: {
        where.publishTime = undefined;
      }
    }
    return super.page(where, pageNo, pageSize);
  }
}
