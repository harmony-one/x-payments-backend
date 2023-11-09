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
import { RefillDto } from './dto/refill.dto';
import { AppStorePurchaseDto } from './dto/purchase.dto';

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

  // @Get('/:userId/balance')
  // @ApiParam({
  //   name: 'userId',
  //   required: true,
  //   description: 'User uuid',
  //   schema: { oneOf: [{ type: 'string' }] },
  // })
  // @ApiOkResponse({
  //   type: Number,
  // })
  // async getUserBalance(@Param() params: { userId: string }) {
  //   const { userId } = params;
  //
  //   const user = await this.userService.getUserById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //
  //   return user.balance;
  // }

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

  @Get('/deviceId/:deviceId')
  @ApiParam({
    name: 'deviceId',
    required: true,
    description: 'User deviceId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: UserEntity,
  })
  async getUserByDeviceId(@Param() params: { deviceId: string }) {
    const { deviceId } = params;
    const user = await this.userService.getUserByDeviceId(deviceId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('/create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    type: UserEntity,
  })
  async createUser(@Body() dto: CreateUserDto): Promise<UserEntity> {
    const { deviceId, appleId } = dto;

    if (appleId) {
      const user = await this.userService.getUserByAppleId(appleId);
      if (user) {
        throw new BadRequestException('User with given appleId already exists');
      }
    }

    if (deviceId) {
      const user = await this.userService.getUserByDeviceId(deviceId);
      if (user) {
        throw new BadRequestException(
          'User with given deviceId already exists',
        );
      }
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
  async refill(@Body() dto: RefillDto): Promise<UserEntity> {
    return await this.userService.refill(dto);
  }

  @Post('/appStorePurchase')
  @UsePipes(new ValidationPipe({ transform: true }))
  async appStorePurchase(
    @Body() dto: AppStorePurchaseDto,
  ): Promise<UserEntity> {
    const user = await this.userService.getUserById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userService.appStorePurchase(dto);
  }
}
