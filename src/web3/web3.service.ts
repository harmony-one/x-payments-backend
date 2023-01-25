import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OneCountry } from 'one-country-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class Web3Service {
  private oneCountry: OneCountry;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const provider = new Web3.providers.HttpProvider(
      configService.get('web3.rpcUrl'),
    );
    this.oneCountry = new OneCountry({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
      privateKey: configService.get('web3.oneWalletPrivateKey'),
    });
  }

  getPriceByName(name: string) {
    return this.oneCountry.getPriceByName(name);
  }

  // Coingecko Free plan API https://www.coingecko.com/en/api/documentation
  async getTokenPriceById(id: string, currency: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`,
      ),
    );
    return data;
  }

  async getDomainPriceByName(name: string) {
    return this.oneCountry.getPriceByName(name);
  }

  async rent(
    name: string,
    url: string,
    price: string,
    telegram: string,
    email: string,
    phone: string,
  ) {
    const tx = await this.oneCountry.rent(
      name,
      url,
      price,
      telegram,
      email,
      phone,
    );
    return tx;
  }
}
