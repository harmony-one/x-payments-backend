import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Web3Service } from './web3.service';

@ApiTags('web3')
@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}
  @Get('/price/:id')
  async getPrice(@Param('id') id: string) {
    const currency = 'usd';
    const data = await this.web3Service.getTokenPriceById(id, currency);
    if (data[id] && data[id][currency]) {
      return data[id][currency];
    }
    throw new BadRequestException('Unknown token id');
  }
}
