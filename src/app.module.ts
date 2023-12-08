import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config';
import { typeormConfig } from './config/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './user/user.module';
import { AppstoreModule } from './appstore/appstore.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig, configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    // Web3Module,
    HttpModule,
    ScheduleModule.forRoot(),
    UserModule,
    AppstoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
