import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config';
import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';
import entities from './typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './user/user.module';
import { AppstoreModule } from './appstore/appstore.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // Web3Module,
    HttpModule,
    ScheduleModule.forRoot(),
    UserModule,
    AppstoreModule,
  ],
  controllers: [AppController, StripeController],
  providers: [AppService, StripeService],
})
export class AppModule {}
