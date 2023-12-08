import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString } from 'class-validator';
import { UserEntity } from './user.entity';

export enum UserStatus {
  active = 'active',
  deleted = 'deleted',
}

@Entity({ name: 'blockchain_accounts' })
export class BlockchainAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  privateKey: string;

  @IsString()
  @Column({
    type: 'varchar',
    default: '',
  })
  address: string;

  @OneToOne(() => UserEntity, (user) => user.account)
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
