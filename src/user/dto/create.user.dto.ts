import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { AppName, UserType } from 'src/typeorm/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsEnum(AppName)
  appName: AppName;

  @ApiProperty()
  @IsEnum(UserType)
  userType: UserType;
}
