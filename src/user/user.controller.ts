import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { StripePaymentEntity } from '../typeorm';
import { Web3Service } from '../web3/web3.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import { WithdrawFundsDto } from './dto/withdraw.dto';
import { ConfigService } from '@nestjs/config';
import { BotApiKeyGuard } from '../auth/ApiKeyGuard';
import { GetUserPaymentsDto } from './dto/payments.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/id/:userId')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Telegram/Discord userId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: StripePaymentEntity,
  })
  async getUserById(@Param() params) {
    const { userId } = params;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { privateKey, ...rest } = user;

    return {
      ...rest,
    };
  }

  @Get('/balance/:userId')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Telegram/discord userId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: StripePaymentEntity,
  })
  async getUserBalance(@Param() params) {
    const { userId } = params;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balanceOne = await this.web3Service.getAddressBalance(
      user.userAddress,
    );

    const balanceUsd = await this.web3Service.convertOneToUsd(balanceOne);

    return {
      one: balanceOne,
      usd: balanceUsd,
    };
  }

  @Post('/create')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutOneCountryRent(@Body() dto: CreateUserDto) {
    const { userId } = dto;
    const user = await this.userService.getUserById(userId);
    if (user) {
      return user; // throw new BadRequestException('User already exists');
    }

    const newUser = await this.userService.createUser(dto);
    return newUser;
  }

  @Post('/pay')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(BotApiKeyGuard)
  async withdrawFunds(@Body() dto: WithdrawFundsDto) {
    const { userId, amountUsd } = dto;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const amountOne = await this.web3Service.convertUsdToOne(amountUsd);

    const balance = await this.web3Service.getAddressBalance(user.userAddress);
    if (+balance - 0.01 - +amountOne < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    const botHolderAddress = this.configService.get(
      'telegram.botHolderAddress',
    );

    if (!botHolderAddress.startsWith('0x')) {
      throw new BadRequestException(
        'Bot tokens holder address not configured on service side',
      );
    }

    const transferData = await this.web3Service.transferOne(
      user.privateKey,
      botHolderAddress,
      amountOne,
    );

    const payment = await this.userService.createUserPayment(
      dto,
      amountOne,
      transferData.transactionHash,
    );
    return payment;
  }

  @Get('/payments')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPayments(@Query() dto: GetUserPaymentsDto) {
    const data = await this.userService.getPayments(dto);
    return data;
  }
}
