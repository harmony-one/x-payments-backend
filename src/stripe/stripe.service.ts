import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto, StripeCheckoutDto } from "./dto/checkout.dto";
import { DataSource } from 'typeorm';
import { StripePaymentEntity } from '../typeorm';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentStatus } from '../typeorm/stripe.payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    const secretKey = configService.get('stripe.secretKey');
    const apiVersion = configService.get('stripe.apiVersion');
    this.stripe = new Stripe(secretKey, { apiVersion });
  }
  async createStripeSession(dto: StripeCheckoutDto) {
    const { mode, successUrl, cancelUrl } = dto;

    const clientUrl = this.configService.get('client.url');
    const priceId = this.configService.get('stripe.priceId');
    const subscriptionPriceId = this.configService.get(
      'stripe.subscriptionPriceId',
    );

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: mode === 'payment' ? priceId : subscriptionPriceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl || `${clientUrl}/success`,
      cancel_url: cancelUrl || `${clientUrl}/canceled`,
    });
    return session;
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const {
      name,
      description = '',
      currency = 'usd',
      amount,
      quantity = 1,
      successUrl,
      cancelUrl,
    } = dto;

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          // price: mode === 'payment' ? priceId : subscriptionPriceId,
          quantity,
          price_data: {
            currency,
            unit_amount: amount, // amount in USD cents
            product_data: {
              name,
              // description,
              // images: ['https://example.com/t-shirt.png'],
            },
          },
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }

  async createStripePayment(dto: CreatePaymentDto) {
    await this.dataSource.manager.insert(StripePaymentEntity, {
      product: dto.product,
      opType: dto.opType,
      sessionId: dto.sessionId,
      userAddress: dto.userAddress || '',
      amount: dto.amount,
      params: dto.params,
    });
  }

  async getPaymentBySessionId(sessionId: string) {
    const row = await this.dataSource.manager.findOne(StripePaymentEntity, {
      where: {
        sessionId,
      },
    });
    return row;
  }

  async setPaymentStatus(sessionId: string, status: PaymentStatus) {
    await this.dataSource.manager.update(
      StripePaymentEntity,
      {
        sessionId,
      },
      {
        status,
      },
    );
  }

  // Verify that request is from Stripe
  // https://stripe.com/docs/payments/checkout/fulfill-orders
  verifyEvent(payload: any, sig: string) {
    let event;
    const endpointSecret = this.configService.get('stripe.endpointSecret');

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.log('Error:', err.message);
      return null;
    }

    return event;
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const { currency } = dto;
    const intent = await this.stripe.paymentIntents.create({
      amount: 100,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return intent;
  }
}
