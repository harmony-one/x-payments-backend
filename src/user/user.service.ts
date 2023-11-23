import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseEntity, UserEntity, WithdrawEntity } from '../typeorm';
import { ConfigService } from '@nestjs/config';
import { WithdrawDto } from './dto/withdraw.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { RefillDto } from './dto/refill.dto';
import { AppStorePurchaseDto, PurchaseListDto } from './dto/purchase.dto';
import { UpdateDto } from './dto/update.dto';
import { JWSTransactionDecodedPayload } from 'app-store-server-api/dist/types/Models';
import { UserStatus } from '../typeorm/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}
  async getUserById(id: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        id,
        status: UserStatus.active,
      },
    });
  }

  async getPurchaseByTransactionId(transactionId: string) {
    return await this.dataSource.manager.findOne(PurchaseEntity, {
      where: {
        transactionId,
      },
    });
  }

  async getUserByAppleId(appleId: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        appleId,
        status: UserStatus.active,
      },
    });
  }

  async getUserByDeviceId(deviceId: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        deviceId,
        status: UserStatus.active,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    const balance = this.configService.get('initialCreditsAmount');
    const result = await this.dataSource.manager.insert(UserEntity, {
      appleId: dto.appleId,
      deviceId: dto.deviceId,
      balance,
    });

    const user = result.raw[0];

    this.logger.log(
      `Created new user ${user.id}, appleId: ${dto.appleId}, deviceId: ${dto.deviceId}`,
    );

    return user;
  }

  async withdraw(
    userId: string,
    dto: WithdrawDto,
    creditsAmount: number,
  ): Promise<UserEntity> {
    const { tokensAmount } = dto;
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - creditsAmount;

    if (balanceAfter < 0) {
      throw new BadRequestException('Not enough balance');
    }

    await this.dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      {
        balance: balanceAfter,
      },
    );

    await this.dataSource.manager.insert(WithdrawEntity, {
      userId,
      creditsAmount,
      tokensAmount,
      balanceBefore,
      balanceAfter,
    });

    return this.getUserById(userId);
  }

  getCreditsByProductId(productId: string) {
    return 0;
  }

  getSubscriptionDaysByProductId(productId: string) {
    if (productId === 'com.country.x.purchase.3day') {
      return 3;
    }
    return 0;
  }

  async refill(dto: RefillDto): Promise<UserEntity> {
    const { userId, amount } = dto;
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const maxAmount = 1000000;
    if (amount > maxAmount) {
      throw new BadRequestException(`Max amount to refill: ${maxAmount}`);
    }

    const newUserBalance = user.balance + amount;

    await this.dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      {
        balance: newUserBalance,
      },
    );
    return this.getUserById(userId);
  }

  async insertAppStorePurchase(
    userId: string,
    dto: AppStorePurchaseDto,
    transaction: JWSTransactionDecodedPayload,
    creditsAmount: number,
  ): Promise<UserEntity> {
    const { transactionId } = dto;

    const result = await this.dataSource.manager.insert(PurchaseEntity, {
      userId,
      transactionId,
      productId: transaction.productId,
      creditsAmount,
      transaction,
    });

    this.logger.log(
      `New purchase userId ${userId}, ${transaction.productId}, creditsAmount: ${creditsAmount}`,
    );

    return result.raw[0];
  }

  async updateExpirationDate(userId: string, expirationDate: Date) {
    await this.dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      {
        expirationDate,
      },
    );
  }

  async updateUser(userId: string, dto: UpdateDto): Promise<UserEntity> {
    const { deviceId, appleId } = dto;

    const partialEntity: { deviceId?: string; appleId?: string } = {};

    if (deviceId) {
      partialEntity.deviceId = deviceId;
    }
    if (appleId) {
      partialEntity.appleId = appleId;
    }

    await this.dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      {
        ...partialEntity,
      },
    );
    return this.getUserById(userId);
  }

  async getUserPayments(userId: string, dto: PurchaseListDto) {
    const { offset, limit, ...rest } = dto;

    const [items, count] = await this.dataSource.manager.findAndCount(
      PurchaseEntity,
      {
        where: {
          id: userId,
          ...rest,
        },
        skip: offset,
        take: limit,
        order: {
          id: 'desc',
        },
      },
    );

    return {
      items,
      count,
    };
  }

  async deleteUser(userId: string) {
    const res = await this.dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      {
        status: UserStatus.deleted,
      },
    );
    this.logger.log(`Deleted user ${userId}`);
    return res;
  }
}
