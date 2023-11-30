import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export enum UserStatus {
  active = 'active',
  deleted = 'deleted',
}

@Entity({ name: 'users' })
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  deviceId: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  appleId: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  balance: number;

  @ApiProperty()
  @Column({
    type: 'varchar',
    enum: UserStatus,
    default: UserStatus.active,
  })
  status: UserStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'expirationDate' })
  expirationDate: Date;

  @IsBoolean()
  @IsOptional()
  protected isSubscriptionActive = false;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  generateIsSubscriptionActive(): void {
    this.isSubscriptionActive = Date.now() <= this.expirationDate.valueOf();
  }

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  appVersion: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
