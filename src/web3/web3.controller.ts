import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { DomainPriceResponseDto } from '../stripe/dto/domains.dto';

@ApiTags('web3')
@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}
  @Get('/tokenPrice/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'Get token price, USD. Full coins list: https://api.coingecko.com/api/v3/coins/list.',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: String,
  })
  async getTokenPrice(@Param('id') id: string) {
    const currency = 'usd';
    const data = await this.web3Service.getTokenPrice(id, currency);
    return data;
  }

  @Get('/domainPrice/:name')
  @ApiParam({
    name: 'name',
    required: true,
    description: '1country domain price in USD cents',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: DomainPriceResponseDto,
  })
  async getDomainPrice(@Param('name') name: string) {
    const one = await this.web3Service.getDomainPriceInOne(name);
    const usd = await this.web3Service.getCheckoutUsdAmount(one);

    return {
      one,
      usd,
    };
  }

  @Get('/balance/:address')
  @ApiParam({
    name: 'address',
    required: true,
    description: 'Harmony address, starting with 0x',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: String,
  })
  async getBalance(@Param('address') balance: string) {
    const data = await this.web3Service.getAddressBalance(balance);
    return data;
  }
}
