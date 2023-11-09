import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../typeorm';
import { ConfigService } from '@nestjs/config';
import { PayDto } from './dto/pay.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { RefillDto } from './dto/refill.dto';
import { AppStorePurchaseDto } from './dto/purchase.dto';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}
  async getUserById(id: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        id,
      },
    });
  }

  async getUserByAppleId(appleId: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        appleId,
      },
    });
  }

  async getUserByDeviceId(deviceId: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        deviceId,
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

    return result.raw[0];
  }

  async pay(dto: PayDto): Promise<UserEntity> {
    const { userId, amount } = dto;
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newUserBalance = user.balance - amount;

    if (newUserBalance < 0) {
      throw new BadRequestException('Not enough balance');
    }

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

  async appStorePurchase(dto: AppStorePurchaseDto): Promise<UserEntity> {
    const { deviceId, originalTransactionId } = dto;

    await this.dataSource.manager.update(
      UserEntity,
      {
        deviceId,
      },
      {
        originalTransactionId,
      },
    );
    return this.getUserByDeviceId(deviceId);
  }
}
