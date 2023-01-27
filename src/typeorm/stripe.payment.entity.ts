import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  waitingForPayment = 'waiting_for_payment',
  paid = 'paid',
  rented = 'rented',
  completed = 'completed',
  expired = 'expired', // Expired by timeout on Stripe side
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

  @Column({
    type: 'varchar',
  })
  sessionId: string;

  @Column({
    type: 'varchar',
    enum: StripeProduct,
  })
  product: StripeProduct;

  @Column({
    type: 'varchar',
    enum: StripeProductOpType,
  })
  opType: StripeProductOpType;

  @Column({
    type: 'varchar',
    enum: PaymentStatus,
    default: PaymentStatus.waitingForPayment,
  })
  status: PaymentStatus;

  @Column({
    type: 'integer',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'varchar',
    default: '',
  })
  userAddress?: string;

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
