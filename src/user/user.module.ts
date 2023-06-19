import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { Web3Module } from '../web3/web3.module';
import { Web3Service } from '../web3/web3.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, Web3Module, HttpModule],
  providers: [UserService, Web3Service],
  controllers: [UserController],
})
export class UserModule {}
