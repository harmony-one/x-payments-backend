import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export enum StripeMode {
  payment = 'payment',
  subscription = 'subscription',
}

export class StripeCheckoutDto {
  @ApiPropertyOptional({ enum: StripeMode })
  @IsString()
  @IsOptional()
  mode = StripeMode.payment;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}

class OneCountryRentParams {
  @ApiProperty()
  @IsString()
  domainName: string;
}

export class CheckoutOneCountryRentDto {
  @ApiProperty()
  @IsString()
  userAddress: string;

  @ApiProperty({ type: () => OneCountryRentParams })
  params: OneCountryRentParams;

  @ApiProperty()
  @IsString()
  successUrl: string;

  @ApiProperty()
  @IsString()
  cancelUrl: string;
}

export class VideoContractParams {
  @ApiProperty()
  @IsString()
  user: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  aliasName: string;

  @ApiProperty()
  @IsNumber()
  paidAt: number;
}

export class CheckoutVideoPayDto {
  @ApiProperty({ type: () => VideoContractParams })
  params: VideoContractParams;

  @ApiProperty()
  @IsString()
  successUrl: string;

  @ApiProperty()
  @IsString()
  cancelUrl: string;
}

export class SendDonationForParams {
  @ApiProperty()
  @IsString()
  user: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  aliasName: string;
}

export class SendDonationForDto {
  @ApiProperty()
  @IsString()
  amountOne: string;

  @ApiProperty({ type: () => VideoContractParams })
  params: SendDonationForParams;

  @ApiProperty()
  @IsString()
  successUrl: string;

  @ApiProperty()
  @IsString()
  cancelUrl: string;
}

export class CheckoutVideoPayPriceDto {
  @ApiProperty({ description: 'Domain name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Alias name' })
  @IsString()
  aliasName: string;
}

export class CreateCheckoutSessionDto {
  name: string;

  @IsOptional()
  description?;

  @IsOptional()
  currency?;

  amount: number;

  @IsOptional()
  quantity?;

  successUrl: string;

  cancelUrl: string;
}

export class CheckoutCreateResponseDto {
  @ApiProperty()
  @IsString()
  @Expose()
  sessionId: string;

  @ApiProperty()
  @IsNumber()
  amountUsd: string;

  @ApiProperty()
  @IsNumber()
  amountOne: string;

  @ApiProperty()
  @IsString()
  @Expose()
  paymentUrl: string;
}

export class CheckoutAmountResponseDto {
  @ApiProperty()
  amountOne: string;

  @ApiProperty()
  amountUsd: string;
}
