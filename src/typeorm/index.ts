import { StripePaymentEntity } from './stripe.payment.entity';
import {
  UserEntity,
  UserPaymentEntity,
  UserSubscriptionEntity,
} from './user.entity';

const entities = [
  StripePaymentEntity,
  UserEntity,
  UserPaymentEntity,
  UserSubscriptionEntity,
];

export {
  StripePaymentEntity,
  UserEntity,
  UserPaymentEntity,
  UserSubscriptionEntity,
};
export default entities;
