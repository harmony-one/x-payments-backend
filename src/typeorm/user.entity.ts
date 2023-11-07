import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum UserType {
  single = 'single',
  group = 'group',
  server = 'server',
}

export enum SubscriberStatus {
  active = 'active',
  past_due = 'past_due',
  unpaid = 'unpaid',
  canceled = 'canceled',
  incomplete = 'incomplete',
  incomplete_expired = 'incomplete_expired',
  trialing = 'trialing',
  paused = 'paused',
}
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity({ name: 'user_subscriptions' })
export class UserSubscriptionEntity {
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
    default: '',
  })
  customerId: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  subscriptionId: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  priceId: string;

  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  quantity: number;

  @IsEnum(SubscriberStatus)
  @Column({
    type: 'varchar',
    enum: UserType,
    default: SubscriberStatus.canceled,
  })
  status: SubscriberStatus;

  @Column({ type: 'timestamp' })
  expirationAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
