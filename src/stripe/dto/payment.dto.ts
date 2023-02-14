import {
  PaymentStatus,
  StripePaymentEntity,
  CheckoutMethod,
} from '../../typeorm/stripe.payment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  method: CheckoutMethod;
  sessionId: string;
  amountUsd: string;
  amountOne: string;
  params: object;
  userAddress? = '';
}

export class ListAllPaymentsDto {
  @ApiProperty({
    type: CheckoutMethod,
    enum: CheckoutMethod,
    required: false,
  })
  @IsEnum(CheckoutMethod)
  @IsOptional()
  opType?: CheckoutMethod;

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
  sessionId?: string;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  userAddress?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class ListAllPaymentsResponseDto {
  items: StripePaymentEntity[];
  count: number;
}
