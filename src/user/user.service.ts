import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OneCountrySubscription } from '../typeorm';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}
  async isUserSubscribed(name: string, userAddress: string) {
    const subscriberRow = await this.dataSource.manager.findOne(
      OneCountrySubscription,
      {
        where: {
          name,
          userAddress,
        },
      },
    );
    return !!subscriberRow;
  }
}
