import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { UserType } from 'src/typeorm/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  appName: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserType)
  userType: UserType;
}
