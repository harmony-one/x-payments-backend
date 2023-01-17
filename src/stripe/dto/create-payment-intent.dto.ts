import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ default: 'card' })
  @IsString()
  paymentMethodType: string;

  @ApiProperty({ default: 'usd' })
  @IsString()
  currency: string;
}
