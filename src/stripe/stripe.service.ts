import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { addDays } from 'date-fns';
import { DataSource } from 'typeorm';

import { CreateCheckoutSessionDto } from './dto/checkout.dto';
import { StripePaymentEntity } from '../typeorm';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentStatus } from '../typeorm/stripe.payment.entity';
import {
  CreatePaymentDto,
  CreateSubscriptionDto,
  ListAllPaymentsDto,
  ListAllPaymentsResponseDto,
} from './dto/payment.dto';
import { Web3Service } from '../web3/web3.service';
import { CreateUserDto } from 'src/user/dto/create.user.dto';
import {
  SubscriberStatus,
  UserSubscriptionEntity,
  UserType,
} from 'src/typeorm/user.entity';

@Injectable()
export class StripeService {
  public stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    const secretKey = configService.get('stripe.secretKey');
    const apiVersion = configService.get('stripe.apiVersion');
    this.stripe = new Stripe(secretKey, { apiVersion });
  }

  async createCustomer(dto: CreateUserDto) {
    const { appName = '', userType = UserType.single } = dto;
    const params: Stripe.CustomerCreateParams = {
      metadata: {
        appName,
        userType,
      },
    };
    const customer = await this.stripe.customers.create(params);
    return customer;
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const {
      mode = 'payment',
      // name = 'test',
      // description = '',
      // currency = 'usd',
      // amount,
      // quantity = 1,
      successUrl,
      cancelUrl,
    } = dto;
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1O4dRcGdB7xhLnN1b7xvZspp',
          quantity: 1,
          // quantity,
          // price_data: {
          //   currency,
          //   unit_amount: amount * 100, // amount in USD cents
          //   product_data: {
          //     name,
          //     // description,
          //     // images: ['https://example.com/t-shirt.png'],
          //   },
          // },
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  }

  async savePayment(dto: CreatePaymentDto) {
    await this.dataSource.manager.insert(StripePaymentEntity, {
      paymentType: dto.paymentType,
      method: dto.method,
      sessionId: dto.sessionId,
      amountUsd: dto.amountUsd,
      amountCredits: dto.amountCredits,
      params: dto.params,
    });
  }

  async saveSubscription(dto: CreateSubscriptionDto) {
    await this.dataSource.manager.insert(UserSubscriptionEntity, {
      ...dto,
      expirationAt: addDays(new Date(), 30),
      quantity: 25,
    });
  }

  async subscriptionUsage(subscriptionId: string) {
    const usage = await this.stripe.subscriptionItems.createUsageRecord(
      subscriptionId,
      {
        quantity: 1,
      },
    );
    return usage;
  }

  async getActiveSubscription(userId: string) {
    const row = await this.dataSource.manager.findOne(UserSubscriptionEntity, {
      where: {
        userId,
        status: SubscriberStatus.active,
      },
    });
    return row;
  }

  async getPaymentBySessionId(sessionId: string) {
    const row = await this.dataSource.manager.findOne(StripePaymentEntity, {
      where: {
        sessionId,
      },
    });
    return row;
  }

  async getSubscriptionBySessionId(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session) {
      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription.toString(),
      );
      return subscription;
    }
    return null;
  }

  async getPayments(
    dto: ListAllPaymentsDto,
  ): Promise<ListAllPaymentsResponseDto> {
    const { offset, limit, ...rest } = dto;
    const [items, count] = await this.dataSource.manager.findAndCount(
      StripePaymentEntity,
      {
        where: {
          ...rest,
        },
        skip: offset,
        take: limit,
        order: {
          id: 'desc',
        },
      },
    );

    return {
      items,
      count,
    };
  }

  async setPaymentStatus(sessionId: string, status: PaymentStatus) {
    this.logger.log(`Set payment status: ${status}, session id: ${sessionId}`);
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

  // https://stripe.com/docs/webhooks/signatures
  verifyWebhookEvent(rawBody: Buffer, sig: string) {
    const endpointSecret = this.configService.get('stripe.endpointSecret');
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      sig,
      endpointSecret,
    );
    return event;
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const { currency = 'usd', amount } = dto;
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return intent;
  }

  async handleCheckoutPaymentSuccess(sessionId: string) {
    const payment = await this.getPaymentBySessionId(sessionId);

    if (!payment) {
      this.logger.error(`Cannot find payment with sessionId: ${sessionId}`);
      return;
    }

    if (payment.status !== PaymentStatus.pending) {
      this.logger.error(
        `Payment ${sessionId} has status ${payment.status}, expected status: ${PaymentStatus.pending}, exit`,
      );
      return;
    }

    await this.setPaymentStatus(sessionId, PaymentStatus.processing);

    this.logger.log(`Processing payment ${JSON.stringify(payment)}`);

    try {
      await this.setPaymentStatus(sessionId, PaymentStatus.completed);
    } catch (e) {
      await this.setPaymentStatus(sessionId, PaymentStatus.processingFailed);
      this.logger.error(`Cannot complete payment ${sessionId}: ${e.message}`);
    }
  }
}
