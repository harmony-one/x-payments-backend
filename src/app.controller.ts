import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('app')
@Controller()
export class AppController {
  @Get('/version')
  getVersion() {
    return '0.0.1';
  }
}
