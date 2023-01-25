import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeCheckoutDto } from './dto/checkout.dto';
import { DataSource } from 'typeorm';
import { Payments, Subscription } from "../typeorm";
import { PaymentStatus } from '../typeorm/payments.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CheckoutOneCountryDto } from './dto/checkout.onecountry.dto';
import { SubscriptionStatus } from "../typeorm/subscription.entity";

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

  async createStripeSessionOneCountry(dto: CheckoutOneCountryDto) {
    const {
      amountUsd,
      amountOne,
      domain,
      url,
      userAddress,
      successUrl,
      cancelUrl,
    } = dto;

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          // price: mode === 'payment' ? priceId : subscriptionPriceId,
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountUsd || 100, // amount in cents
            product_data: {
              name: 'One subscription',
              description: 'Get access to ONE domains',
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

  async createSubscription(dto: CheckoutOneCountryDto, sessionId: string) {
    const {
      domain,
      url,
      userAddress,
      telegram,
      email,
      phone,
      amountOne,
      amountUsd,
    } = dto;

    await this.dataSource.manager.insert(Subscription, {
      sessionId,
      domain,
      userAddress,
      url,
      telegram,
      email,
      phone,
      amountOne,
      amountUsd,
    });
  }

  async getSubscriptionBySessionId(sessionId: string) {
    const row = await this.dataSource.manager.findOne(Subscription, {
      where: {
        sessionId,
      },
    });
    return row;
  }

  async setSubscriptionStatus(sessionId: string, status: SubscriptionStatus) {
    await this.dataSource.manager.update(
      Subscription,
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
