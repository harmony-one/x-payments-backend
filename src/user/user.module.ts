import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StripeService } from '../stripe/stripe.service';

@Module({
  imports: [],
  providers: [UserService, StripeService],
  controllers: [UserController],
})
export class UserModule {}
