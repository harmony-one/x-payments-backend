import {
  StripeProduct,
  StripeProductOpType,
} from '../../typeorm/stripe.payment.entity';

export class CreatePaymentDto {
  product: StripeProduct;
  opType: StripeProductOpType;
  sessionId: string;
  amount: number;
  params: object;
  userAddress? = '';
}
