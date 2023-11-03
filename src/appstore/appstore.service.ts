import { Injectable } from '@nestjs/common';
import { AppStoreServerAPI, Environment } from 'app-store-server-api';

const KEY = ``;

const KEY_ID = '';
const ISSUER_ID = '';
const APP_BUNDLE_ID = 'country.x.artem';

@Injectable()
export class AppstoreService {
  api: AppStoreServerAPI;
  constructor() {
    this.api = new AppStoreServerAPI(
      KEY,
      KEY_ID,
      ISSUER_ID,
      APP_BUNDLE_ID,
      Environment.Sandbox,
    );
    this.test().catch((e) => {
      console.log('e', e);
    });
  }

  async test() {
    await this.api.getTransactionHistory('2');
  }
}
