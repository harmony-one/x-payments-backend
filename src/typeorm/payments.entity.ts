import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  waiting = 'waiting',
  completed = 'completed',
}

@Entity()
export class Payments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  sessionId: string;

  @Column({
    type: 'varchar',
    enum: PaymentStatus,
    default: PaymentStatus.waiting,
  })
  status: PaymentStatus;

  @Column({
    type: 'varchar',
  })
  ownerAddress: string;

  @Column({
    type: 'varchar',
  })
  subscriberAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
