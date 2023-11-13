import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class WithdrawDto {
  @ApiProperty()
  @IsNumber()
  tokensAmount: number;
}
