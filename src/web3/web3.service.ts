import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OneCountry } from 'one-country-sdk';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class Web3Service {
  private oneCountry: OneCountry;
  constructor(private configService: ConfigService) {
    const provider = new Web3.providers.HttpProvider(
      configService.get('web3.rpcUrl'),
    );
    this.oneCountry = new OneCountry({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
    });
  }

  getPriceByName(name: string) {
    return this.oneCountry.getPriceByName(name);
  }
}
