import {
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
  async createUser(): Promise<UserEntity> {
    return await this.userService.createUser();
  }

  @Post('/pay')
  @UsePipes(new ValidationPipe({ transform: true }))
  async pay(@Body() dto: PayDto): Promise<UserEntity> {
    return await this.userService.pay(dto);
  }
}
