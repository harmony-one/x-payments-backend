import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity, UserPaymentEntity } from '../typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { Web3Service } from '../web3/web3.service';
import { WithdrawFundsDto } from './dto/withdraw.dto';
import { GetUserPaymentsDto } from './dto/payments.dto';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private readonly web3Service: Web3Service,
  ) {}
  async getUserById(userId: string) {
    return await this.dataSource.manager.findOne(UserEntity, {
      where: {
        userId,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    const { userId } = dto;

    const account = this.web3Service.createAccount();

    const result = await this.dataSource.manager.insert(UserEntity, {
      userId,
      userAddress: account.address,
      privateKey: account.privateKey,
    });

    return result.raw[0];
  }

  async createUserPayment(
    dto: WithdrawFundsDto,
    amount: string,
    txHash: string,
  ) {
    const { userId } = dto;
    const result = await this.dataSource.manager.insert(UserPaymentEntity, {
      userId,
      txHash,
      amount,
    });
    return result.raw[0];
  }

  async getPayments(dto: GetUserPaymentsDto) {
    const { offset, limit, ...rest } = dto;
    const [items, count] = await this.dataSource.manager.findAndCount(
      UserPaymentEntity,
      {
        where: {
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
}
