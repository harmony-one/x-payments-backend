import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OneCountryRentParams } from './checkout.dto';

export class CreatePaymentIntentRentDto {
  @ApiProperty()
  @IsString()
  userAddress: string;

  @ApiProperty({ type: () => OneCountryRentParams })
  params: OneCountryRentParams;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ default: 'card' })
  @IsString()
  paymentMethodType?: string;

  @ApiProperty({ default: 'usd' })
  @IsString()
  currency?: string;

  @ApiProperty({ default: 100 })
  @IsString()
  @IsOptional()
  amount: number;
}
