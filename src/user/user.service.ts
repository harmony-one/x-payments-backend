import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { Web3Service } from '../web3/web3.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private readonly web3Service: Web3Service,
    private readonly stripeService: StripeService,
  ) {}
  async getUserById(userId: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        userId,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    const { userId, userType, appName } = dto;

    const account = this.web3Service.createAccount();
    const customer = await this.stripeService.createCustomer(dto);
    const result = await this.dataSource.manager.insert(UserEntity, {
      userId,
      userType,
      appName,
      customerId: customer.id,
      userAddress: account.address,
    });

    return result.raw[0];
  }
}
