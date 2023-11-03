import { Module } from '@nestjs/common';
import { AppstoreService } from './appstore.service';

@Module({
  providers: [AppstoreService]
})
export class AppstoreModule {}
