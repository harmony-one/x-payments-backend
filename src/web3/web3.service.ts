import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OneCountry } from 'one-country-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
import { StripePaymentEntity } from '../typeorm';

@Injectable()
export class Web3Service {
  private oneCountry: OneCountry;
  private shortReelsVideos: OneCountry;
  private vanityUrl: OneCountry;
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

    this.shortReelsVideos = new OneCountry({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
      shortReelsVideosContractAddress: configService.get(
        'web3.videoReelsContractAddress',
      ),
      privateKey: configService.get('web3.videoReelsPrivateKey'),
    });

    this.vanityUrl = new OneCountry({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
      vanityUrlContractAddress: configService.get(
        'web3.vanityUrlContractAddress',
      ),
      privateKey: configService.get('web3.vanityUrlPrivateKey'),
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
    return this.oneCountry.getPriceByName(name);
  }

  getOneCountryAccountAddress() {
    return this.oneCountry.accountAddress;
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

  async getAddressBalance(address: string) {
    const web3 = new Web3(this.configService.get('web3.rpcUrl'));
    const balance = await web3.eth.getBalance(address);
    return balance;
    // return web3.utils.toWei(balance);
  }

  async getOneCountryServiceBalance() {
    const balance = await this.getAddressBalance(
      this.oneCountry.accountAddress,
    );
    return balance;
  }

  async transferToken(to: string, name: string) {
    const from = this.oneCountry.accountAddress;
    const tx = await this.oneCountry.safeTransferFrom(from, to, name);
    return tx;
  }

  getVanityUrlPrice(domainName: string, aliasName: string) {
    return this.vanityUrl.getVanityUrlPrice(domainName, aliasName);
  }

  async payForVanityURLAccessFor(payment: StripePaymentEntity) {
    const { amountOne, params } = payment;
    const tx = await this.shortReelsVideos.payForVanityURLAccessFor(
      params.user,
      params.name,
      params.aliasName,
      amountOne,
      params.paidAt,
    );
    return tx;
  }

  async sendDonationFor(payment: StripePaymentEntity) {
    const { amountOne, params } = payment;
    const tx = await this.shortReelsVideos.sendDonationFor(
      params.user,
      params.name,
      params.aliasName,
      amountOne,
    );
    return tx;
  }
}
