import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class HarmonyXIntentDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  amountUsd: string;
}
