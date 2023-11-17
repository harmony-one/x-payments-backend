import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { Web3Service } from '../web3/web3.service';
import { HttpModule } from '@nestjs/axios';
import { AppstoreService } from '../appstore/appstore.service';
import { AppstoreModule } from '../appstore/appstore.module';

@Module({
  imports: [ConfigModule, HttpModule, AppstoreModule],
  providers: [UserService, Web3Service, AppstoreService],
  controllers: [UserController],
})
export class UserModule {}
