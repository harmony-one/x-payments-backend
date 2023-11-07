import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from '../typeorm';
import { PayDto } from './dto/pay.dto';
import { CreateUserDto } from './dto/create.user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:userId')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User uuid',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: UserEntity,
  })
  async getUserById(@Param() params: { userId: string }) {
    const { userId } = params;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('/appleId/:appleId')
  @ApiParam({
    name: 'appleId',
    required: true,
    description: 'User appleId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: UserEntity,
  })
  async getUserByAppleId(@Param() params: { appleId: string }) {
    const { appleId } = params;

    const user = await this.userService.getUserByAppleId(appleId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('/:userId/balance')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User uuid',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: Number,
  })
  async getUserBalance(@Param() params: { userId: string }) {
    const { userId } = params;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.balance;
  }

  @Post('/create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    type: UserEntity,
  })
  async createUser(@Body() dto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userService.getUserByAppleId(dto.appleId);
    if (user) {
      throw new BadRequestException('User with given appleId already exists');
    }
    return await this.userService.createUser(dto);
  }

  @Post('/pay')
  @UsePipes(new ValidationPipe({ transform: true }))
  async pay(@Body() dto: PayDto): Promise<UserEntity> {
    return await this.userService.pay(dto);
  }

  @Post('/refill')
  @UsePipes(new ValidationPipe({ transform: true }))
  async refill(@Body() dto: PayDto): Promise<UserEntity> {
    return await this.userService.refill(dto);
  }
}
