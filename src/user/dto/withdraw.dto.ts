import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WithdrawFundsDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  amountOne: string;
}
