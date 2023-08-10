import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { PageVO } from './PageVO';
import { BaseAlbumVO, BaseSingerVO, BaseSongVO } from './BaseVO';

@ApiExtraModel(BaseSingerVO)
export class SongVO extends BaseSongVO {
  @ApiProperty({ type: () => BaseAlbumVO, description: '专辑名' })
  album: BaseAlbumVO;

  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(BaseSingerVO) }, description: '专辑名' })
  singers: Array<BaseSingerVO>;
}

export class SongListVO extends PageVO(SongVO) {}
