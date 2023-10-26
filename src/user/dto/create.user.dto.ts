import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { UserType } from 'src/typeorm/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  appName: string;

  @ApiProperty()
  @IsEnum(UserType)
  userType: UserType;
}
