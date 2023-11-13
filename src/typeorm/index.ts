import { StripePaymentEntity } from './stripe.payment.entity';
import { UserEntity, UserSubscriptionEntity } from './user.entity';
import { PurchaseEntity } from './purchase.entity';
import { WithdrawEntity } from './withdraw.entity';

const entities = [
  StripePaymentEntity,
  UserEntity,
  UserSubscriptionEntity,
  PurchaseEntity,
  WithdrawEntity,
];

export {
  StripePaymentEntity,
  UserEntity,
  UserSubscriptionEntity,
  PurchaseEntity,
  WithdrawEntity,
};
export default entities;
