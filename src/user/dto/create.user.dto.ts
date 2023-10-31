import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { UserType } from 'src/typeorm/user.entity';

export class CreateUserDto {}
