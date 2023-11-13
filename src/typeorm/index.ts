import { StripePaymentEntity } from './stripe.payment.entity';
import { UserEntity, UserSubscriptionEntity } from './user.entity';
import { PurchaseEntity } from './purchase.entity';

const entities = [
  StripePaymentEntity,
  UserEntity,
  UserSubscriptionEntity,
  PurchaseEntity,
];

export {
  StripePaymentEntity,
  UserEntity,
  UserSubscriptionEntity,
  PurchaseEntity,
};
export default entities;
