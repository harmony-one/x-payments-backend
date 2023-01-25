import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { ConfigModule } from '@nestjs/config';
import { Web3Controller } from './web3.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [Web3Service],
  controllers: [Web3Controller],
})
export class Web3Module {}
