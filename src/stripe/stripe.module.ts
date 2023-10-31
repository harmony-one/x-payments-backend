import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Service } from '../web3/web3.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot()],
  controllers: [StripeController],
  providers: [StripeService, Web3Service],
})
export class StripeModule {}
