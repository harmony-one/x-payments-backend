import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';

export enum PaymentStatus {
  pending = 'pending', // Payment has begun, but is not complete
  failed = 'failed', // Failed on Stripe side
  processing = 'processing', // Payment completed, contract call processing by service
  processingFailed = 'processing_failed', // Contract call failed on payments service side
  completed = 'completed', // Payment that has been paid and contract was successfully called
  expired = 'expired', // Expired by event from Stripe side
}

export enum StripeProduct {
  oneCountry = 'oneCountry',
  shortReelsVideos = 'shortReelsVideos',
}

export enum StripeProductOpType {
  rent = 'rent',
  videoPay = 'videoPay',
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
  @IsEnum(StripeProduct)
  @Column({
    type: 'varchar',
    enum: StripeProduct,
  })
  product: StripeProduct;

  @ApiProperty()
  @IsEnum(StripeProductOpType)
  @Column({
    type: 'varchar',
    enum: StripeProductOpType,
  })
  opType: StripeProductOpType;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    enum: PaymentStatus,
    default: PaymentStatus.pending,
  })
  status: PaymentStatus;

  @ApiProperty()
  @IsNumber()
  @Column({
    type: 'integer',
    default: 0,
  })
  amount: number;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  userAddress?: string;

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
