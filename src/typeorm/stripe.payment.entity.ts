import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString } from 'class-validator';

export enum PaymentType {
  checkout = 'checkout',
  paymentIntent = 'payment_intent',
}

export enum PaymentStatus {
  pending = 'pending', // Payment was initiated by user
  failed = 'failed', // Payment failed on Stripe side
  processing = 'processing', // Payment completed, smart contract call processing by service
  processingFailed = 'processing_failed', // Smart contract call failed on Payments service side
  completed = 'completed', // Payment that has been paid and contract was successfully called.
  expired = 'expired', // Payment session expired on the Stripe side
}

export enum CheckoutMethod {
  rent = 'rent',
}

@Entity({ name: 'stripe_payments' })
export class StripePaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
  })
  sessionId: string;

  @ApiProperty()
  @IsEnum(CheckoutMethod)
  @Column({
    type: 'varchar',
    enum: CheckoutMethod,
  })
  method: CheckoutMethod;

  @ApiProperty()
  @IsEnum(PaymentType)
  @Column({
    type: 'varchar',
    enum: PaymentType,
    default: PaymentType.checkout,
  })
  paymentType: PaymentType;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    enum: PaymentStatus,
    default: PaymentStatus.pending,
  })
  status: PaymentStatus;

  @ApiProperty()
  @Column({
    type: 'varchar',
    default: '',
  })
  txHash: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '0',
  })
  amountUsd: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '0',
  })
  amountOne: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  userAddress: string;

  @ApiProperty()
  @IsObject()
  @Column({
    type: 'simple-json',
    nullable: false,
    default: {},
  })
  params: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity({ name: 'stripe_subscriptions' })
export class StripeSubscriptionEntity {
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
