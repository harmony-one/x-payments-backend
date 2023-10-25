import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { Web3Module } from '../web3/web3.module';
import { Web3Service } from '../web3/web3.service';
import { HttpModule } from '@nestjs/axios';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  imports: [ConfigModule, Web3Module, HttpModule],
  providers: [UserService, Web3Service, StripeService],
  controllers: [UserController],
})
export class UserModule {}
