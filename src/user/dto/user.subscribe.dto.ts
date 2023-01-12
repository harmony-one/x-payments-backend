import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSubscribeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subscriberAddress: string;
}
