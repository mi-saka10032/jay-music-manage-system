import { ApiExtraModel, ApiProperty, getSchemaPath } from '@midwayjs/swagger';
import { PageVO } from './PageVO';
import { BaseSingerVO, BaseSongVO } from './BaseVO';

@ApiExtraModel(BaseSongVO)
export class SingerVO extends BaseSingerVO {
  @ApiProperty({ type: 'array', items: { $ref: () => getSchemaPath(BaseSongVO) }, description: '歌曲列表' })
  songs: Array<BaseSongVO>;
}

export class SingerListVO extends PageVO(SingerVO) {}
