import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionStatus {
  waitingForPayment = 'waiting_for_payment',
  paid = 'paid',
  rented = 'rented',
  completed = 'completed',
}

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  sessionId: string;

  @Column({
    type: 'varchar',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.waitingForPayment,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'varchar',
  })
  domain: string;

  @Column({
    type: 'varchar',
  })
  userAddress: string;

  @Column({
    type: 'varchar',
  })
  url: string;

  @Column({
    type: 'varchar',
  })
  telegram: string;

  @Column({
    type: 'varchar',
  })
  email: string;

  @Column({
    type: 'varchar',
  })
  phone: string;

  @Column({
    type: 'integer',
  })
  amountOne: number;

  @Column({
    type: 'integer',
  })
  amountUsd: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
