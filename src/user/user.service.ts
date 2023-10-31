import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../typeorm';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { PayDto } from './dto/pay.dto';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}
  async getUserById(id: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        id,
      },
    });
  }

  async createUser() {
    const balance = this.configService.get('initialCreditsAmount');
    // const customer = await this.stripeService.createCustomer(dto);
    const result = await this.dataSource.manager.insert(UserEntity, {
      // customerId: customer.id,
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
}
