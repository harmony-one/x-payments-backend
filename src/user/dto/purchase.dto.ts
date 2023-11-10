import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AppStorePurchaseDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  transactionId: string;
}

export class PurchaseListDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ type: String, required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset = 0;

  @ApiProperty({ type: Number, required: false, default: 100 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit = 100;
}
