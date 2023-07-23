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
    return ['id', 'singerName', 'coverUrl'];
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
