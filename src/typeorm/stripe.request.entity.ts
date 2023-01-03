import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StripeCheckoutSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  sessionId: string;

  @Column({
    type: 'integer',
  })
  createdAt: number;

  @Column({
    type: 'varchar',
  })
  currency: string;
}
