import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum StripeMode {
  payment = 'payment',
  subscription = 'subscription',
}

export class StripeCheckoutDto {
  @ApiPropertyOptional({ enum: StripeMode })
  @IsString()
  @IsOptional()
  mode = StripeMode.payment;
}
