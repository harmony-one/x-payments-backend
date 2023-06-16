import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserPaymentsDto {
  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  txHash?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiProperty({ type: Number, required: false, default: 100 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
