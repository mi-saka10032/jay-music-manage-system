import { Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Page } from '../common/Page';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { AlbumDTO } from '../api/dto/AlbumDTO';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';

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
  async dateRangeQuery(albumDTO: AlbumDTO, pageNo: number, pageSize: number): Promise<Page<AlbumVO>> {
    Assert.notNull(albumDTO, ErrorCode.UN_ERROR, '查询参数不能为空');
    const wheres: Array<FindOptionsWhere<Album>> = [];
    if (albumDTO.startPublishTime) {
      Assert.notDate(albumDTO.startPublishTime, ErrorCode.UN_ERROR, 'startPublishTime不是一个有效日期');
      const where: FindOptionsWhere<Album> = { publishTime: MoreThanOrEqual(albumDTO.startPublishTime) };
      wheres.push(where);
    }
    if (albumDTO.endPublishTime) {
      Assert.notDate(albumDTO.endPublishTime, ErrorCode.UN_ERROR, 'endPublishTime不是一个有效日期');
      const where: FindOptionsWhere<Album> = { publishTime: LessThanOrEqual(albumDTO.startPublishTime) };
      wheres.push(where);
    }
    if (albumDTO.albumName || albumDTO.coverUrl) {
      const where: FindOptionsWhere<Album> = {
        albumName: albumDTO.albumName,
        coverUrl: albumDTO.coverUrl,
      };
      this.fuzzyWhere(where);
      wheres.push(where);
    }
    const skip = !isNaN(pageNo) ? (pageNo - 1) * pageSize : 0;
    const take = !isNaN(pageSize) ? pageSize : 10;
    Assert.notNull(0 < take && take < 1000, ErrorCode.UN_ERROR, '0 < pageSize < 1000');
    const select = this.getColumns();
    const order = { createTime: 'desc' } as FindOptionsOrder<Album>;
    const [list, total]: [Album[], number] = await this.getModel().findAndCount({
      select,
      where: wheres.length > 0 ? wheres : {}, // SQL-WHERE多条件重复字段查询，需要调整为数组形式；但是一旦数组长度为0，则必须更换为普通对象
      order,
      skip,
      take,
    });
    const albumVO = new Array<AlbumVO>();
    Object.assign(albumVO, list);
    return Page.build(albumVO, total, pageNo, pageSize);
  }
}
