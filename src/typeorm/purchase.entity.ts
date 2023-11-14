import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsUUID } from 'class-validator';

@Entity({ name: 'purchases' })
export class PurchaseEntity {
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
    type: 'varchar',
    default: '',
  })
  transactionId: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  productId: string;

  @IsString()
  @Column({
    type: 'integer',
    default: 0,
  })
  creditsAmount: number;

  @ApiProperty()
  @IsObject()
  @Column({
    type: 'simple-json',
    nullable: false,
    default: {},
  })
  transaction: object;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
