import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Subscriptions } from '../typeorm';
import { UserSubscribeDto } from './dto/user.subscribe.dto';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}
  async isUserSubscribed(ownerAddress: string, subscriberAddress: string) {
    const subscriberRow = await this.dataSource.manager.findOne(Subscriptions, {
      where: {
        ownerAddress,
        subscriberAddress,
      },
    });
    return !!subscriberRow;
  }

  async subscribe(dto: UserSubscribeDto) {
    const { ownerAddress, subscriberAddress } = dto;
    await this.dataSource.manager.insert(Subscriptions, {
      ownerAddress,
      subscriberAddress,
    });
  }
}
