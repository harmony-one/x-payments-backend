import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DCEns } from 'one-country-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class Web3Service {
  private dc: DCEns;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const provider = new Web3.providers.HttpProvider(
      configService.get('web3.rpcUrl'),
    );
    this.dc = new DCEns({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
      privateKey: configService.get('web3.oneWalletPrivateKey'),
    });
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

  async getDomainPriceInOne(name: string) {
    const price = await this.dc.getPrice(name);
    return price.amount;
  }

  getOneCountryAccountAddress() {
    return this.dc.accountAddress;
  }

  async getCheckoutUsdAmount(amountOne: string): Promise<string> {
    const minAmount = this.configService.get('stripe.checkoutMinAmount');
    const oneRate = await this.getTokenPrice('harmony');
    const value = (oneRate * +amountOne) / Math.pow(10, 18);
    const usdCents = Math.ceil(value * 100);
    if (minAmount) {
      return Math.max(usdCents, minAmount).toString();
    }
    return usdCents.toString();
  }

  private async sleep(timeout: number) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }

  async validateDomainRent(domainName: string) {
    const serviceBalance = await this.getOneCountryServiceBalance();
    const amountOne = await this.getDomainPriceInOne(domainName);
    const balanceDelta = +serviceBalance - +amountOne;
    if (balanceDelta <= 0) {
      throw new InternalServerErrorException(
        `Insufficient funds to rent domain "${domainName}": required: ${amountOne}, on service balance: ${serviceBalance}`,
      );
    }
    const amountUsd = await this.getCheckoutUsdAmount(amountOne);

    return {
      amountOne,
      amountUsd,
    };
  }

  async register(domainName: string, ownerAddress: string) {
    const secret = Math.random().toString(26).slice(2);
    const commitment = await this.dc.makeCommitment(
      domainName,
      ownerAddress,
      secret,
    );
    await this.dc.commit(commitment);
    await this.sleep(5000);
    const tx = await this.dc.register(domainName, ownerAddress, secret);
    return tx.transactionHash;
  }

  async getAddressBalance(address: string) {
    const web3 = new Web3(this.configService.get('web3.rpcUrl'));
    return await web3.eth.getBalance(address);
    // return web3.utils.toWei(balance);
  }

  async getOneCountryServiceBalance() {
    return await this.getAddressBalance(this.dc.accountAddress);
  }
}
