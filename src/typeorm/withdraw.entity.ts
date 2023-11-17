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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @IsUUID()
  @Column({
    type: 'varchar',
    default: '',
  })
  userId: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  tokensAmount: number;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  creditsAmount: number;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  balanceBefore: number;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  balanceAfter: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
