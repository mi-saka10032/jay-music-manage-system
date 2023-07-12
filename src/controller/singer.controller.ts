import { ApiBearerAuth, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../common/BaseController';
import { Singer } from '../entity/singer';
import { Body, Controller, Inject, Post, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { SingerService } from '../service/singer.service';
import { BaseService } from '../common/BaseService';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { UserService } from '../service/user.service';
import { Page } from '../common/Page';
import { SingerDTO } from '../api/dto/SingerDTO';
import { SingerListVO } from '../api/vo/SingerListVO';

@ApiTags(['singer'])
@ApiBearerAuth()
@Controller('/api/singer')
export class SingerController extends BaseController<Singer> {
  @Inject()
  ctx: Context;

  @Inject()
  singerService: SingerService;

  @Inject()
  userService: UserService;

  getService(): BaseService<Singer> {
    return this.singerService;
  }

  @ApiResponse({ type: Singer })
  @Post('/create', { description: '新增歌手' })
  async createSinger(@Body() singerDTO: SingerDTO): Promise<Singer> {
    Assert.isTrue(singerDTO.singerName !== null, ErrorCode.UN_ERROR, 'singerName不能为空');
    const singer: Singer = new Singer();
    singer.singerName = singerDTO.singerName;
    this.userService.injectUserid(singer);
    const newSinger: Singer = await super.create(singer);
    return Object.assign(newSinger);
  }

  @ApiResponse({ type: Boolean })
  @Post('/delete', { description: '根据id删除指定歌手' })
  async delete(@Query('id') id: number): Promise<boolean> {
    return super.delete(id);
  }

  @ApiResponse({ type: SingerListVO })
  @Post('/page', { description: '歌手分页查询带歌手名模糊搜索' })
  async querySinger(@Body() singerDTO: SingerDTO): Promise<Page<Singer>> {
    const map: Map<string, any> = new Map(Object.entries(singerDTO));
    return super.page(map);
  }

  @ApiResponse({ type: Singer })
  @Post('/findById', { description: '根据id查询歌手' })
  async findById(@Query('id') id: number): Promise<Singer> {
    return super.findById(id);
  }
}
