import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

@Entity({ name: 'withdrawals' })
export class WithdrawEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @IsUUID()
  @Column({
    type: 'varchar',
    default: '',
  })
  userId: string;

  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  tokensAmount: number;

  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  creditsAmount: number;

  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  balanceBefore: number;

  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  balanceAfter: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
