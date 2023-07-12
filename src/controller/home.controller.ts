import { Controller, Get } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {
  @Get('/', { description: '框架自带默认接口 无视' })
  async home(): Promise<string> {
    return 'Hello JayMusicManageSystem!';
  }
}
