import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  appleId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deviceId?: string;
}
