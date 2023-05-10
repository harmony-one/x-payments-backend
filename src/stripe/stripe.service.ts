import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateCheckoutSessionDto,
  StripeCheckoutDto,
} from './dto/checkout.dto';
import { DataSource } from 'typeorm';
import { StripePaymentEntity } from '../typeorm';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import {
  CheckoutMethod,
  PaymentStatus,
} from '../typeorm/stripe.payment.entity';
import {
  CreatePaymentDto,
  ListAllPaymentsDto,
  ListAllPaymentsResponseDto,
} from './dto/payment.dto';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  constructor(
    private configService: ConfigService,
    private web3Service: Web3Service,
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

  async savePayment(dto: CreatePaymentDto) {
    await this.dataSource.manager.insert(StripePaymentEntity, {
      paymentType: dto.paymentType,
      method: dto.method,
      sessionId: dto.sessionId,
      userAddress: dto.userAddress || '',
      amountUsd: dto.amountUsd,
      amountOne: dto.amountOne,
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
      if (payment.method === CheckoutMethod.rent) {
        await this.onPaymentOneCountryRent(payment);
      } else {
        throw new Error(`Unknown method: ${payment.method}`);
      }

      await this.setPaymentStatus(sessionId, PaymentStatus.completed);
    } catch (e) {
      await this.setPaymentStatus(sessionId, PaymentStatus.processingFailed);
      this.logger.error(`Cannot complete payment ${sessionId}: ${e.message}`);
    }
  }

  async onPaymentOneCountryRent(payment: StripePaymentEntity) {
    const { sessionId, userAddress, params } = payment;
    const { domainName } = params;

    const tx = await this.web3Service.register(domainName, userAddress);
    await this.setPaymentStatus(sessionId, PaymentStatus.completed);

    this.logger.log(
      `Domain "${domainName}" rented by user "${userAddress}", tx hash: "${tx.transactionHash}"`,
    );
  }
}
