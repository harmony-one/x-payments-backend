import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class Web3Service {
  private web3;
  private readonly logger = new Logger(Web3Service.name);
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const RPCUrl = this.configService.get('web3.rpcUrl');

    const provider = new Web3.providers.HttpProvider(RPCUrl);
    this.web3 = new Web3(provider);
  }

  // CoinGecko Free plan API https://www.coingecko.com/en/api/documentation
  async getTokenPrice(id = 'harmony', currency = 'usd'): Promise<number> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`,
      ),
    );
    if (data && data[id] && data[id][currency]) {
      return data[id][currency];
    }
    throw new Error(
      `Cannot find pair id: ${id}, currency: ${currency}. Check CoinGecko API.`,
    );
  }

  async getAddressBalance(address: string) {
    return await this.web3.eth.getBalance(address);
    // return web3.utils.toWei(balance);
  }

  async convertOneToUsd(amount: string) {
    const oneRate = await this.getTokenPrice('harmony');
    const value = (oneRate * +amount) / Math.pow(10, 18);
    return value.toFixed(2);
  }

  async convertUsdToOne(amount: string) {
    const oneRate = await this.getTokenPrice('harmony');
    const value = (+amount * Math.pow(10, 18)) / oneRate;
    return value.toString();
  }

  createAccount() {
    return this.web3.eth.accounts.create();
  }

  createAccountFromPhrase(phrase: string) {
    const secret = this.configService.get('web3.secretPhrase');
    const privateKey = this.web3.utils.sha3(`${secret}_${phrase}`);
    if (privateKey) {
      return this.web3.eth.accounts.privateKeyToAccount(privateKey);
    }
    throw new Error('Cannot generate private key from ' + phrase);
  }
}
