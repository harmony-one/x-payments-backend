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
import { PaymentStatus, StripeProduct } from '../typeorm/stripe.payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';
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
    this.logger.log(`SessionId ${sessionId} set payment status: ${status}`);
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

  async onCheckoutPaymentSuccess(sessionId: string) {
    const payment = await this.getPaymentBySessionId(sessionId);

    if (!payment) {
      this.logger.error(`Cannot find payment with sessionId: "${sessionId}"`);
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
      switch (payment.product) {
        case StripeProduct.oneCountry: {
          await this.onPaymentOneCountryRent(payment);
          break;
        }
        case StripeProduct.shortReelsVideos: {
          await this.onPaymentVideoPay(payment);
          break;
        }
        default: {
          this.logger.error(`Unknown product: ${payment.product}, return`);
          return;
        }
      }

      await this.setPaymentStatus(sessionId, PaymentStatus.completed);
    } catch (e) {
      await this.setPaymentStatus(sessionId, PaymentStatus.processingFailed);
      this.logger.error(`Cannot complete payment ${sessionId}: ${e.message}`);
    }
  }

  async onPaymentVideoPay(payment: StripePaymentEntity) {
    const { params } = payment;
    const tx = await this.web3Service.payForVideoVanityURLAccess(params);
    this.logger.log(`Transaction hash: ${tx.transactionHash}`);
  }

  async onPaymentOneCountryRent(payment: StripePaymentEntity) {
    const { sessionId, userAddress, params } = payment;

    const { name, url, telegram, email, phone } = params;

    const domainPrice = await this.web3Service.getDomainPriceByName(name);

    this.logger.log(`Domain ${name} current price: ${domainPrice}`);

    const rentTx = await this.web3Service.rent(
      name,
      url,
      domainPrice,
      telegram,
      email,
      phone,
    );

    this.logger.log(
      `Domain ${name} rented by BE, transaction hash: ${rentTx.transactionHash}`,
    );

    // Wait until transaction will be confirmed
    await new Promise((resolve) =>
      setTimeout(resolve, this.configService.get('web3.txConfirmTimeout')),
    );

    const transferTx = await this.web3Service.transferToken(userAddress, name);

    this.logger.log(
      `Domain ${name} transferred from service to user address ${userAddress}, transaction hash: ${transferTx.transactionHash}`,
    );

    await this.setPaymentStatus(sessionId, PaymentStatus.completed);
  }
}
