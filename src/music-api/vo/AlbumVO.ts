import { BaseAlbumVO, BaseSongVO } from './BaseVO';
import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { PageVO } from './PageVO';

@ApiExtraModel(BaseSongVO)
export class AlbumVO extends BaseAlbumVO {
  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(BaseSongVO) }, description: '歌曲列表' })
  songs: Array<BaseSongVO>;
}

export class AlbumListVO extends PageVO(AlbumVO) {}
