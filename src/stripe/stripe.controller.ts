import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import {
  CheckoutAmountResponseDto,
  CheckoutCreateResponseDto,
  CheckoutOneCountryRentDto,
  CreateCheckoutSessionDto,
  OneCountryRentDto,
} from './dto/checkout.dto';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Web3Service } from '../web3/web3.service';
import { ConfigService } from '@nestjs/config';
import {
  CheckoutMethod,
  PaymentStatus,
  PaymentType,
  StripePaymentEntity,
} from '../typeorm/stripe.payment.entity';
import {
  CreatePaymentDto,
  ListAllPaymentsDto,
  ListAllPaymentsResponseDto,
} from './dto/payment.dto';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';
import { SubscriberStatus } from 'src/typeorm/user.entity';
import { HarmonyXIntentDto } from './dto/harmonyx.dto';

@ApiTags('stripe')
@Controller('/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly web3Service: Web3Service,
    private readonly configService: ConfigService,
  ) {}

  @Post('/webhook')
  @ApiExcludeEndpoint()
  async stripeWebHook(
    @Headers('stripe-signature') signature,
    @Req() req: RawBodyRequest<Request>, // Don't remove, required by Stripe to construct event and verify signature (https://stripe.com/docs/webhooks/signatures)
    @Res() res,
    @Body() body,
  ) {
    const { id, type } = body;
    this.logger.log(`Received Stripe webhook event id: ${id}, type: ${type}`);

    if (this.configService.get('stripe.verifyWebhookEvent')) {
      try {
        this.stripeService.verifyWebhookEvent(req.rawBody, signature);
      } catch (e) {
        this.logger.error(`Cannot verify webhook event: ${e.message}, exit`);
        return;
      }
    } else {
      this.logger.warn(
        `Stripe webhook signature verification is disabled. Turn on in production: STRIPE_VERIFY_WEBHOOK_EVENT=true.`,
      );
    }

    switch (type) {
      case 'checkout.session.completed': {
        const sessionId = body.data.object.id;
        this.stripeService.handleCheckoutPaymentSuccess(sessionId);
        break;
      }
      case 'payment_intent.succeeded': {
        const sessionId = body.data.object.id;
        this.stripeService.handleCheckoutPaymentSuccess(sessionId);
        break;
      }
      case 'checkout.session.expired': {
        const sessionId = body.data.object.id;
        await this.stripeService.setPaymentStatus(
          sessionId,
          PaymentStatus.expired,
        );
        break;
      }
    }
    res.json({ received: true });
  }

  @Get('/subscription/:userId')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'UserId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  async getActiveSubscription(@Param() params): Promise<any> {
    const { userId } = params;
    if (userId) {
      const subscription = await this.stripeService.getActiveSubscription(
        userId,
      );
      if (subscription) {
        return subscription;
      } else {
        throw new NotFoundException('Subscription not found');
      }
    } else {
      throw new BadRequestException('Missing sessionId argument');
    }
  }

  @Post('/subscription')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createSubscription(@Body() dto: CreateCheckoutSessionDto) {
    const { amount, customer, successUrl, cancelUrl, userId } = dto;

    this.logger.log(`Checkout oneCountry rent request: ${JSON.stringify(dto)}`);

    const checkoutDto: CreateCheckoutSessionDto = {
      mode: 'subscription',
      name: '1.country',
      customer: customer,
      // description: `Rent domain: ${dto.params.name}.1.country`,
      amount: amount,
      successUrl: successUrl + `/{CHECKOUT_SESSION_ID}`, //
      cancelUrl,
    };
    const session = await this.stripeService.createCheckoutSession(checkoutDto); // checkoutDto);

    const paymentDto: CreatePaymentDto = {
      paymentType: PaymentType.checkout,
      method: CheckoutMethod.rent,
      sessionId: session.id,
      amountUsd: `${amount}`,
      amountCredits: '',
      params: {},
    };

    await this.stripeService.savePayment(paymentDto);

    this.logger.log(
      `Created new payment session: ${session.id}, dto: ${JSON.stringify(dto)}`,
    );
    // return redirect(session.url, code=303)
    return {
      url: session.url,
      amountUsd: amount,
      amountOne: 0,
      // sessionId: session.id,
      // paymentUrl: session.url,
    };
  }

  @Post('/subscription/usage/:subscriptionId')
  @ApiParam({
    name: 'subscriptionId',
    required: true,
    description: 'Subcription ID',
    schema: { oneOf: [{ type: 'string' }] },
  })
  async subscriptionUsage(@Param() params) {
    const { subscriptionId } = params;
    const usage = this.stripeService.subscriptionUsage(subscriptionId);
    console.log(usage);
    return 'OK';
    // {
    //   url: session.url,
    //   amountUsd: amount,
    //   amountOne: 0,
    //   // sessionId: session.id,
    //   // paymentUrl: session.url,
    // };
  }

  @Get('/checkout/success/:userId/:sessionId')
  @ApiParam({
    name: 'sessionId',
    required: true,
    description: 'Stripe sessionId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'UserId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  async getSuccess(@Param() params): Promise<string> {
    const { sessionId, userId } = params;
    if (sessionId) {
      const subscription = await this.stripeService.getSubscriptionBySessionId(
        sessionId,
      );
      if (subscription) {
        await this.stripeService.saveSubscription({
          userId: userId,
          customerId: subscription.customer.toString(),
          priceId: subscription.items.data[0].price.id,
          subscriptionId: subscription.id,
          status: SubscriberStatus.active,
        });
        return '<html><body><h1>Thanks for your order</h1></body></html>';
      } else {
        throw new NotFoundException('Subscription not found');
      }
    } else {
      throw new BadRequestException('Missing sessionId argument');
    }
  }

  @Get('/checkout/cancel')
  async getCancel(): Promise<string> {
    return 'CANCEL';
  }

  @Post('/create-payment-intent/harmonyx')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPaymentIntentHarmonyX(@Body() dto: HarmonyXIntentDto) {
    const { userId, amountUsd } = dto;

    this.logger.log(
      `Received create payment intent request: ${JSON.stringify(dto)}`,
    );

    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: +amountUsd,
    });

    const paymentDto: CreatePaymentDto = {
      paymentType: PaymentType.paymentIntent,
      method: CheckoutMethod.rent,
      sessionId: paymentIntent.id,
      amountUsd,
      amountCredits: '1',
      params: {},
    };

    await this.stripeService.savePayment(paymentDto);
    return paymentIntent;
  }

  @Get('/payment/:sessionId')
  @ApiParam({
    name: 'sessionId',
    required: true,
    description: 'Stripe sessionId',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiOkResponse({
    type: StripePaymentEntity,
  })
  async getPayment(@Param() params) {
    const { sessionId } = params;
    const payment = await this.stripeService.getPaymentBySessionId(sessionId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  @ApiSecurity('X-API-KEY')
  @Get('/payments')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(ApiKeyGuard)
  @ApiOkResponse({
    type: ListAllPaymentsResponseDto,
  })
  async getPayments(@Query() dto: ListAllPaymentsDto) {
    return await this.stripeService.getPayments(dto);
  }
}
