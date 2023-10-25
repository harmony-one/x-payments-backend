import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { StripePaymentEntity } from '../typeorm';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import { GetUserPaymentsDto } from './dto/payments.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

    return user;
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

    return {
      credits: '1',
    };
  }

  @Post('/create')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() dto: CreateUserDto) {
    const { userId } = dto;
    const user = await this.userService.getUserById(userId);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    return await this.userService.createUser(dto);
  }

  @Get('/payments')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPayments(@Query() dto: GetUserPaymentsDto) {
    return await this.userService.getPayments(dto);
  }
}
