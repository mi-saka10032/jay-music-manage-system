import { Provide } from '@midwayjs/decorator';
import { BaseService } from '../common/BaseService';
import { Album } from '../entity/album';
import { AlbumVO } from '../api/vo/AlbumVO';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

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
}
