import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DCEns } from 'one-country-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
import { toBN } from 'web3-utils';

@Injectable()
export class Web3Service {
  private dc: DCEns;
  private web3;
  private readonly serviceAddress: string;
  private readonly logger = new Logger(Web3Service.name);
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const RPCUrl = this.configService.get('web3.rpcUrl');
    const privateKey = this.configService.get('web3.oneWalletPrivateKey');

    const provider = new Web3.providers.HttpProvider(RPCUrl);
    this.dc = new DCEns({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
      privateKey: configService.get('web3.oneWalletPrivateKey'),
    });

    this.web3 = new Web3(provider);

    if (privateKey) {
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(account);
      this.serviceAddress = account.address;
    } else {
      this.logger.error('Web3 service created without private key');
    }
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
    const serviceFee = this.configService.get('web3.serviceFeePercent');
    const userRefillAmount = this.configService.get('web3.userRefillAmountOne');

    const price = await this.dc.getPrice(name);
    let amountOne = price.amount;

    if (serviceFee > 0) {
      const amountOneBn = toBN(amountOne);
      const additionalValue = amountOneBn.mul(toBN(serviceFee)).div(toBN(100));
      amountOne = amountOneBn.add(additionalValue).toString();
    }

    if (userRefillAmount > 0) {
      amountOne = toBN(amountOne).add(toBN(1)).toString();
    }

    return amountOne.toString();
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
    const isAvailable = await this.dc.isAvailable(domainName);

    if (!isAvailable) {
      throw new BadRequestException('Domain not available');
    }

    const serviceBalance = await this.getOneCountryServiceBalance();
    const amountOne = await this.getDomainPriceInOne(domainName);
    const balanceDelta = toBN(serviceBalance).sub(toBN(amountOne));

    if (balanceDelta <= toBN('1')) {
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

  async register(domainName: string, ownerAddress: string): Promise<string> {
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

  async getOneCountryServiceBalance() {
    return await this.getAddressBalance(this.dc.accountAddress);
  }

  async sendOneToAddress(userAddress: string, amountOne: string) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const res = await this.web3.eth.sendTransaction({
      to: userAddress,
      from: this.serviceAddress,
      value: this.web3.utils.toHex(this.web3.utils.toWei(amountOne, 'ether')),
      gasPrice,
      gas: this.web3.utils.toHex(35000),
    });
    return res;
  }

  async transferOne(senderPk: string, receiverAddress: string, amount: string) {
    const provider = new Web3.providers.HttpProvider(
      this.configService.get('web3.rpcUrl'),
    );
    const web3 = new Web3(provider);
    const account = web3.eth.accounts.privateKeyToAccount(senderPk);
    web3.eth.accounts.wallet.add(account);

    const gasPrice = await web3.eth.getGasPrice();
    const res = await web3.eth.sendTransaction({
      to: receiverAddress,
      from: account.address,
      value: web3.utils.toHex(web3.utils.toWei(amount, 'wei')),
      gasPrice,
      gas: web3.utils.toHex(35000),
    });
    return res;
  }

  createAccount() {
    return this.web3.eth.accounts.create();
  }
}
