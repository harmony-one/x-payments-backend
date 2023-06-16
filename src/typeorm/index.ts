import { StripePaymentEntity } from './stripe.payment.entity';
import { UserEntity, UserPaymentEntity } from './user.entity';

const entities = [StripePaymentEntity, UserEntity, UserPaymentEntity];

export { StripePaymentEntity, UserEntity, UserPaymentEntity };
export default entities;
