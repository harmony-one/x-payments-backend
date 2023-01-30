import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OneCountry } from 'one-country-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
import { AbiItem } from 'web3-utils';
import * as ShortReelsVideoAbi from './abi/short-reels-video.abi.json';
import { VideoContractParams } from '../stripe/dto/checkout.dto';

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

  async transferToken(to: string, name: string) {
    const from = this.oneCountry.accountAddress;
    const tx = await this.oneCountry.safeTransferFrom(from, to, name);
    return tx;
  }

  async payForVideoVanityURLAccess(dto: VideoContractParams) {
    const { user, name, aliasName, paidAt } = dto;
    const web3 = new Web3(this.configService.get('web3.rpcUrl'));
    const contractAddress = this.configService.get(
      'web3.videoReelsContractAddress',
    );
    const maintainerPK = this.configService.get('web3.videoReelsPrivateKey');
    if (!maintainerPK) {
      throw new Error(
        'You need to setup env VIDEO_REELS_PRIVATE_KEY to sign video-reels contract transactions',
      );
    }
    const account = web3.eth.accounts.privateKeyToAccount(maintainerPK);
    web3.eth.accounts.wallet.add(account);

    const contract = new web3.eth.Contract(
      ShortReelsVideoAbi as AbiItem[],
      contractAddress,
    );

    const callObj = { from: account.address };
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods
      .payForVideoVanityURLAccess(user, name, aliasName, paidAt)
      .estimateGas(callObj);
    const tx = await contract.methods
      .payForVideoVanityURLAccess(user, name, aliasName, paidAt)
      .send({ ...callObj, gasPrice: gasPrice, gas: gasEstimate });
    return tx;
  }
}
