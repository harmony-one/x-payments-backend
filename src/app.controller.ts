import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
        oneCountryContractAddress: this.configService.get(
          'web3.oneCountryContractAddress',
        ),
        txConfirmTimeout: this.configService.get('web3.txConfirmTimeout'),
      },
    };
  }
}
