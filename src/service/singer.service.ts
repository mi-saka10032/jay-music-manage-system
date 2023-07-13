import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Singer } from '../entity/singer';
import { Repository } from 'typeorm';
import { BaseService } from '../common/BaseService';
import { SingerVO } from '../api/vo/SingerVO';

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

  getColumns(): Array<keyof SingerVO> | undefined {
    return ['id', 'singerName'];
  }
}
