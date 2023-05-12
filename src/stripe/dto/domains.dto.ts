import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DomainPriceResponseDto {
  @ApiPropertyOptional()
  @IsString()
  usd: string;

  @ApiPropertyOptional()
  @IsString()
  one: string;
}
