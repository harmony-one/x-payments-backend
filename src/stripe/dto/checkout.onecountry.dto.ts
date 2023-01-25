import { IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutOneCountryDto {
  @ApiProperty({ description: 'Amount in cents ¢' })
  @Type(() => Number)
  amountUsd: number;

  @ApiProperty({ description: 'Amount in ONE tokens' })
  @Type(() => Number)
  amountOne: number;

  @ApiProperty()
  @IsString()
  domain: string;

  @ApiProperty()
  @IsString()
  userAddress: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  telegram: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  successUrl: string;

  @ApiProperty()
  @IsString()
  cancelUrl: string;
}
