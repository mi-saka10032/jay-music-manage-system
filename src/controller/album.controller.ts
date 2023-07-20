import { ApiBearerAuth, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { Body, Controller, Inject, Post, Query } from '@midwayjs/decorator';
import { BaseController } from '../common/BaseController';
import { Album } from '../entity/album';
import { AlbumListVO, AlbumVO } from '../api/vo/AlbumVO';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { AlbumService } from '../service/album.service';
import { BaseService } from '../common/BaseService';
import { AlbumDTO, NewAlbumDTO } from '../api/dto/AlbumDTO';
import { Assert } from '../common/Assert';
import { ErrorCode } from '../common/ErrorCode';
import { Page } from '../common/Page';

@ApiTags(['album'])
@ApiBearerAuth()
@Controller('/api/album')
export class AlbumController extends BaseController<Album, AlbumVO> {
  @Inject()
  ctx: Context;

  @Inject()
  albumService: AlbumService;

  @Inject()
  userService: UserService;

  getService(): BaseService<Album, AlbumVO> {
    return this.albumService;
  }

  @ApiResponse({ type: AlbumVO })
  @Post('/create', { description: '新增专辑' })
  async createAlbum(@Body() param: NewAlbumDTO): Promise<AlbumVO> {
    const album: Album = new Album();
    if (param.publishTime) {
      Assert.notDate(param.publishTime, ErrorCode.UN_ERROR, 'publishTime不是一个有效日期');
      album.publishTime = new Date(param.publishTime);
    }
    Assert.notNull(param.albumName, ErrorCode.UN_ERROR, 'albumName不能为空');
    album.albumName = param.albumName;
    album.coverUrl = param.coverUrl;
    this.userService.injectUserid(album);
    return super.create(album);
  }

  @ApiResponse({ type: Boolean })
  @Post('/delete', { description: '根据id删除指定' })
  async deleteAlbumById(@Query('id') id: number): Promise<boolean> {
    return super.delete(id);
  }

  @ApiResponse({ type: AlbumListVO })
  @Post('/page', { description: '专辑分页查询' })
  async queryAlbums(@Body() albumDTO: AlbumDTO): Promise<Page<AlbumVO>> {
    const { startPublishTime, endPublishTime, pageNo, pageSize } = albumDTO;
    // 开始或结束日期，一旦存在则需要进行日期格式断言
    if (startPublishTime) {
      Assert.notDate(startPublishTime, ErrorCode.UN_ERROR, 'startPublishTime不是一个有效日期');
      albumDTO.startPublishTime = new Date(startPublishTime);
    }
    if (endPublishTime) {
      Assert.notDate(endPublishTime, ErrorCode.UN_ERROR, 'endPublishTime不是一个有效日期');
      albumDTO.endPublishTime = new Date(endPublishTime);
    }
    Assert.notNull(pageNo != null && pageNo > 0, ErrorCode.UN_ERROR, 'pageNo不能为空');
    Assert.notNull(pageSize != null && pageSize > 0, ErrorCode.UN_ERROR, 'pageSize不能为空');
    return this.albumService.page(albumDTO, pageNo, pageSize);
  }

  @ApiResponse({ type: AlbumVO })
  @Post('/findById', { description: '根据id查询专辑' })
  async findAlbumById(@Query('id') id: number): Promise<AlbumVO> {
    return super.findById(id);
  }
}
