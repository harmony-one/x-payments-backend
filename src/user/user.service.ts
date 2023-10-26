import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { Web3Service } from '../web3/web3.service';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from "@nestjs/config";
import { UserType } from "../typeorm/user.entity";

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private readonly web3Service: Web3Service,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}
  async getUserById(id: number) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        id,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    const { userType = UserType.single, appName = '' } = dto;

    const balance = this.configService.get('initialCreditsAmount');
    const customer = await this.stripeService.createCustomer(dto);
    const result = await this.dataSource.manager.insert(UserEntity, {
      userType,
      appName,
      customerId: customer.id,
      balance,
    });

    return result.raw[0];
  }
}
