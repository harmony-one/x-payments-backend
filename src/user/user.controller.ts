import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { StripePaymentEntity } from '../typeorm';
import { Web3Service } from '../web3/web3.service';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserResponseDto } from "./dto/create.user.dto";

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly userService: UserService,
  ) {}

  @Get('/:userId')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Telegram userId',
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
    description: 'Telegram userId',
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
  @ApiOkResponse({
    description: 'Create new user',
    type: CreateUserResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutOneCountryRent(@Body() dto: CreateUserDto) {
    const { userId } = dto;

    const user = await this.userService.getUserById(userId);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const { privateKey, ...rest } = await this.userService.createUser(dto);
    return { ...rest };
  }
}
