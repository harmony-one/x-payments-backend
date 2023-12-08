import { UserEntity } from './user.entity';
import { PurchaseEntity } from './purchase.entity';
import { WithdrawEntity } from './withdraw.entity';
import { BlockchainAccountEntity } from './blockchain.account.entity';

const entities = [
  UserEntity,
  PurchaseEntity,
  WithdrawEntity,
  BlockchainAccountEntity,
];

export { UserEntity, PurchaseEntity, WithdrawEntity, BlockchainAccountEntity };
export default entities;
