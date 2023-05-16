import {
  PaymentStatus,
  StripePaymentEntity,
  CheckoutMethod,
  PaymentType,
} from '../../typeorm/stripe.payment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  paymentType: PaymentType;
  method: CheckoutMethod;
  sessionId: string;
  amountUsd: string;
  amountOne: string;
  params: object;
  userAddress? = '';
}

export class ListAllPaymentsDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    type: CheckoutMethod,
    enum: CheckoutMethod,
    required: false,
  })
  @IsEnum(CheckoutMethod)
  @IsOptional()
  method?: CheckoutMethod;

  @ApiProperty({
    type: PaymentType,
    enum: PaymentType,
    required: false,
  })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @ApiProperty({
    type: PaymentStatus,
    enum: PaymentStatus,
    required: false,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  txHash?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  amountUsd?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  amountOne?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  userAddress?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiProperty({ type: Number, required: false, default: 100 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class ListAllPaymentsResponseDto {
  items: StripePaymentEntity[];
  count: number;
}
