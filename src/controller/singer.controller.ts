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
import { NewSingerDTO, SingerDTO } from '../api/dto/SingerDTO';
import { SingerListVO, SingerVO } from '../api/vo/SingerVO';

@ApiTags(['singer'])
@ApiBearerAuth()
@Controller('/api/singer')
export class SingerController extends BaseController<Singer, SingerVO> {
  @Inject()
  ctx: Context;

  @Inject()
  singerService: SingerService;

  @Inject()
  userService: UserService;

  getService(): BaseService<Singer, SingerVO> {
    return this.singerService;
  }

  @ApiResponse({ type: SingerVO })
  @Post('/create', { description: '新增歌手' })
  async createSinger(@Body() param: NewSingerDTO): Promise<SingerVO> {
    Assert.isTrue(param.singerName !== null, ErrorCode.UN_ERROR, 'singerName不能为空');
    const singer: Singer = new Singer();
    singer.singerName = param.singerName;
    this.userService.injectUserid(singer);
    return super.create(singer);
  }

  @ApiResponse({ type: Boolean })
  @Post('/delete', { description: '根据id删除指定歌手' })
  async deleteSingerById(@Query('id') id: number): Promise<boolean> {
    return super.delete(id);
  }

  @ApiResponse({ type: SingerListVO })
  @Post('/page', { description: '歌手分页查询带歌手名模糊搜索' })
  async querySingers(@Body() singerDTO: SingerDTO): Promise<Page<SingerVO>> {
    const map: Map<string, any> = new Map(Object.entries(singerDTO));
    return super.page(map);
  }

  @ApiResponse({ type: SingerVO })
  @Post('/findById', { description: '根据id查询歌手' })
  async findSingerById(@Query('id') id: number): Promise<SingerVO> {
    return await super.findById(id);
  }
}
