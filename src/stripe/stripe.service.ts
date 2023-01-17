import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeMode } from './dto/checkout.dto';
import { DataSource } from 'typeorm';
import { Payments, StripeCheckoutSession } from '../typeorm';
import { PaymentStatus } from '../typeorm/payments.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

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
  async createStripeSession(mode = StripeMode.payment) {
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
      success_url: `${clientUrl}/success`,
      cancel_url: `${clientUrl}/canceled`,
    });
    return session;
  }
  async saveStripeSession(session: Stripe.Checkout.Session) {
    const result = await this.dataSource.manager.insert(StripeCheckoutSession, {
      sessionId: session.id,
      createdAt: session.created,
      currency: session.currency,
    });
    return result;
  }

  async createPayment(
    sessionId: string,
    ownerAddress: string,
    subscriberAddress: string,
  ) {
    await this.dataSource.manager.insert(Payments, {
      sessionId,
      ownerAddress,
      subscriberAddress,
    });
  }

  async getPaymentBySessionId(sessionId: string) {
    const row = await this.dataSource.manager.findOne(Payments, {
      where: {
        sessionId,
      },
    });
    return row;
  }

  async setPaymentStatus(sessionId: string, status: PaymentStatus) {
    await this.dataSource.manager.update(
      Payments,
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
    const { currency, paymentMethodType } = dto;
    const intent = await this.stripe.paymentIntents.create({
      amount: 100,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return intent;
  }
}
