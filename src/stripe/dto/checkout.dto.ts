import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

export class OneCountryRentParams {
  @ApiProperty()
  @IsString()
  domainName: string;
}

export class OneCountryRentDto {
  @ApiProperty()
  @IsString()
  userAddress: string;

  @ApiProperty({ type: () => OneCountryRentParams })
  params: OneCountryRentParams;
}

export class CheckoutOneCountryRentDto extends OneCountryRentDto {
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
  customer?;

  @IsOptional()
  mode?;

  @IsOptional()
  description?;

  @IsOptional()
  userId?;

  @IsOptional()
  currency?;

  amount: number;

  @IsOptional()
  quantity?;

  @IsOptional()
  url?;

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
