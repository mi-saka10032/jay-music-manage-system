import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../common/BaseController';
import { Singer } from '../entity/singer';
import { Body, Controller, Inject, Post, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { SingerService } from '../service/singer.service';
import { BaseService } from '../common/BaseService';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../music-api/code/ErrorCode';
import { UserService } from '../service/user.service';
import { Page } from '../common/Page';
import { NewSingerDTO, SingerDTO } from '../music-api/dto/SingerDTO';
import { SingerListVO, SingerVO } from '../music-api/vo/SingerVO';

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
    Assert.baseAssert_CreateObj(param);
    Assert.notNull(param.singerName, ErrorCode.UN_ERROR, 'singerName不能为空');
    const singer: Singer = new Singer();
    singer.coverUrl = param.coverUrl;
    singer.singerName = param.singerName;
    return super.create(singer);
  }

  @ApiBody({ type: NewSingerDTO, isArray: true })
  @Post('/batchCreate', { description: '批量新增歌手' })
  async batchCreateSinger(@Body() params: Array<NewSingerDTO>): Promise<Array<SingerVO>> {
    return Promise.all(params.map((param: NewSingerDTO) => this.createSinger(param)));
  }

  @ApiResponse({ type: SingerVO })
  @Post('/update', { description: '更新歌手信息' })
  async updateSinger(@Body() param: Singer): Promise<SingerVO> {
    return super.update(param);
  }

  @ApiResponse({ type: Boolean })
  @Post('/delete', { description: '根据id删除指定歌手' })
  async deleteSingerById(@Query('id') id: number): Promise<boolean> {
    Assert.baseAssert_DeleteId(id);
    await this.singerService.deleteSinger(id);
    return true;
  }

  @ApiResponse({ type: SingerListVO })
  @Post('/page', { description: '歌手分页查询带歌手名模糊搜索' })
  async querySingers(@Body() singerDTO: SingerDTO): Promise<Page<SingerVO>> {
    Assert.baseAssert_QueryPage(singerDTO);
    const { pageNo, pageSize } = singerDTO;
    return this.singerService.querySingers(singerDTO, pageNo, pageSize);
  }

  @ApiResponse({ type: SingerVO })
  @Post('/findById', { description: '根据id查询歌手' })
  async findSingerById(@Query('id') id: number): Promise<SingerVO> {
    Assert.baseAssert_FindId(id);
    return this.singerService.findSingerById(id);
  }
}
