import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../typeorm';
import { CreateUserDto } from './dto/create.user.dto';
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
    const { userId } = dto;
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.dataSource.manager.update(
      UserEntity,
      {
        id: userId,
      },
      {
        balance: 1,
      },
    );
    return this.getUserById(userId);
  }
}
