import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}
  @Get('/version')
  getVersion() {
    return this.configService.get('version');
  }

  @Get('/status')
  getStatus() {
    return 'OK';
  }

  @Get('/config')
  getConfig() {
    return {
      stripe: {
        publishableKey: this.configService.get('stripe.publishableKey'),
        apiVersion: this.configService.get('stripe.apiVersion'),
      },
      web3: {
        rpcUrl: this.configService.get('web3.rpcUrl'),
      },
    };
  }

  @Get('test/:message')
  @ApiParam({
    name: 'message',
    required: true,
    description: 'message',
    schema: { oneOf: [{ type: 'string' }] },
  })
  async getUserById(@Param() params: { message: string }) {
    const { message } = params;
    console.log('Test message: ', message);
  }
}
