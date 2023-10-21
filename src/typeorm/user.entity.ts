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
  discord = 'discord',
}

export enum UserType {
  single = 'single',
  group = 'group',
  server = 'server',
}
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    type: 'varchar',
    default: '',
  })
  userId: string;

  @ApiProperty()
  @IsEnum(AppName)
  @Column({
    type: 'varchar',
    enum: AppName,
    default: AppName.telegram,
  })
  appName: AppName;

  @ApiProperty()
  @IsEnum(UserType)
  @Column({
    type: 'varchar',
    enum: UserType,
    default: UserType.single,
  })
  userType: UserType;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  customerId: string;

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

@Entity({ name: 'user_payments' })
export class UserPaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    type: 'varchar',
    default: '',
  })
  userId: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '0',
  })
  amount: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  txHash: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
