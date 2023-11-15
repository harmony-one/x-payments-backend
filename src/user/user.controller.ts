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
import { ApiOkResponse, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from '../typeorm';
import { WithdrawDto } from './dto/withdraw.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { AppStorePurchaseDto, PurchaseListDto } from './dto/purchase.dto';
import { UpdateDto } from './dto/update.dto';
import { AppstoreService } from '../appstore/appstore.service';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly appstoreService: AppstoreService,
  ) {}

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

  @ApiSecurity('X-API-KEY')
  @Get('/:userId/purchases')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(ApiKeyGuard)
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User uuid',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: Number,
  })
  async getUserPurchases(
    @Param() params: { userId: string },
    @Query() dto: PurchaseListDto,
  ) {
    const { userId } = params;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userService.getUserPayments(userId, dto);
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

  @Post('/:userId/spend')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('X-API-KEY')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User UUID',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async withdraw(
    @Param() params: { userId: string },
    @Body() dto: WithdrawDto,
  ): Promise<UserEntity> {
    const creditsAmount = Math.round(dto.tokensAmount / 10);
    return await this.userService.withdraw(params.userId, dto, creditsAmount);
  }

  // @Post('/refill')
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async refill(@Body() dto: RefillDto): Promise<UserEntity> {
  //   return await this.userService.refill(dto);
  // }

  @Post('/:userId/purchase')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User UUID',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async appStorePurchase(
    @Param() params: { userId: string },
    @Body() dto: AppStorePurchaseDto,
  ): Promise<UserEntity> {
    const { userId } = params;
    const { transactionId } = dto;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const existedTransaction =
      await this.userService.getPurchaseByTransactionId(transactionId);
    if (existedTransaction) {
      throw new BadRequestException('transcationId already exist');
    }

    const transaction = await this.appstoreService.decodeTransaction(
      transactionId,
    );

    const creditsAmount =
      transaction.quantity *
      this.userService.getCreditsByProductId(transaction.productId);
    await this.userService.insertAppStorePurchase(
      userId,
      dto,
      transaction,
      creditsAmount,
    );
    await this.userService.refill({ userId, amount: creditsAmount });
    return await this.userService.getUserById(userId);
  }

  @Post('/:userId/update')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User UUID',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Param() params: { userId: string },
    @Body() dto: UpdateDto,
  ): Promise<UserEntity> {
    const { userId } = params;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userService.updateUser(userId, dto);
  }
}
