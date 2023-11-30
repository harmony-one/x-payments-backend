import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  appleId?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  appVersion?: string;
}
