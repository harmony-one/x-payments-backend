import { Injectable } from '@nestjs/common';
import { AppStoreServerAPI, Environment } from 'app-store-server-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppstoreService {
  api: AppStoreServerAPI;
  constructor(private configService: ConfigService) {
    const appStoreKey = configService.get('appStore.key');
    const appStoreKeyId = configService.get('appStore.keyId');
    const appStoreIssuerId = configService.get('appStore.issuerId');
    const appStoreBundleId = configService.get('appStore.bundleId');
    this.api = new AppStoreServerAPI(
      appStoreKey,
      appStoreKeyId,
      appStoreIssuerId,
      appStoreBundleId,
      Environment.Sandbox,
    );
    // this.test().catch((e) => {
    //   console.log('e', e);
    // });
  }

  async test() {
    await this.api.getTransactionHistory(
      this.configService.get('appStore.originalTxId'),
    );
  }
}
