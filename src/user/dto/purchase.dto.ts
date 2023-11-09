import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AppStorePurchaseDto {
  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsString()
  originalTransactionId: string;
}
