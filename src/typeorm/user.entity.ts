import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum AppName {
  telegram = 'telegram',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsEnum(AppName)
  @Column({
    type: 'varchar',
    enum: AppName,
    default: AppName.telegram,
  })
  appName: AppName;

  @ApiProperty()
  @Column({
    type: 'varchar',
    default: '',
  })
  userId: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  userAddress: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  privateKey: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
