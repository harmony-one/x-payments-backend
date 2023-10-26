import { StripePaymentEntity } from './stripe.payment.entity';
import { UserEntity, UserSubscriptionEntity } from './user.entity';

const entities = [StripePaymentEntity, UserEntity, UserSubscriptionEntity];

export { StripePaymentEntity, UserEntity, UserSubscriptionEntity };
export default entities;
