import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SpendCreditsDto {
  @ApiProperty()
  @IsNumber()
  tokensAmount: number;
}
