import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Subscription } from '../typeorm';
import { UserSubscribeDto } from './dto/user.subscribe.dto';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}
  async isUserSubscribed(domain: string, userAddress: string) {
    const subscriberRow = await this.dataSource.manager.findOne(Subscription, {
      where: {
        domain,
        userAddress,
      },
    });
    return !!subscriberRow;
  }

  // async subscribe(dto: UserSubscribeDto) {
  //   const { ownerAddress, subscriberAddress } = dto;
  //   await this.dataSource.manager.insert(Subscriptions, {
  //     ownerAddress,
  //     subscriberAddress,
  //   });
  // }
}
