import { Injectable } from '@nestjs/common';
import {
  AppStoreServerAPI,
  decodeTransaction,
  Environment,
} from 'app-store-server-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppstoreService {
  api: AppStoreServerAPI;
  constructor(private configService: ConfigService) {
    const appStoreKey = configService.get('appStore.key');
    const appStoreKeyId = configService.get('appStore.keyId');
    const appStoreIssuerId = configService.get('appStore.issuerId');
    const appStoreBundleId = configService.get('appStore.bundleId');
    const appStoreEnvironment = configService.get('appStore.isProduction')
      ? Environment.Production
      : Environment.Sandbox;

    this.api = new AppStoreServerAPI(
      appStoreKey,
      appStoreKeyId,
      appStoreIssuerId,
      appStoreBundleId,
      appStoreEnvironment,
    );
  }

  async decodeTransaction(transactionId: string) {
    const txSigned = await this.api.getTransactionInfo(transactionId);
    return await decodeTransaction(txSigned.signedTransactionInfo);
  }
}
