import {
  Body,
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
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
  CheckoutVideoPayDto,
  CheckoutVideoPayPriceDto,
  CreateCheckoutSessionDto,
  SendDonationForDto,
  StripeCheckoutDto,
} from './dto/checkout.dto';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Web3Service } from '../web3/web3.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfigService } from '@nestjs/config';
import {
  PaymentStatus,
  StripePaymentEntity,
  CheckoutMethod,
} from '../typeorm/stripe.payment.entity';
import {
  CreatePaymentDto,
  ListAllPaymentsDto,
  ListAllPaymentsResponseDto,
} from './dto/payment.dto';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';

@ApiTags('stripe')
@Controller('/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly web3Service: Web3Service,
    private readonly configService: ConfigService,
  ) {}

  @ApiExcludeEndpoint()
  @Get('/checkout')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCheckoutSession(
    @Res() res,
    @Query() stripeCheckoutDto: StripeCheckoutDto,
  ) {
    const session = await this.stripeService.createStripeSession(
      stripeCheckoutDto,
    );
    res.redirect(303, session.url);
  }

  @ApiExcludeEndpoint()
  @Post('/create-payment-intent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    const paymentIntent = await this.stripeService.createPaymentIntent(dto);
    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  @Post('/webhook')
  @ApiExcludeEndpoint()
  async stripeWebHook(
    @Headers('stripe-signature') signature,
    @Req() req: RawBodyRequest<Request>, // Don't remove, required by Stripe to construct event and verify signature (https://stripe.com/docs/webhooks/signatures)
    @Res() res,
    @Body() body,
  ) {
    const { id, type } = body;
    const verifyEvent = this.configService.get('stripe.verifyWebhookEvent');
    this.logger.log(
      `Received Stripe webhook event id: ${id}, type: ${type}. Verify event signature: ${verifyEvent}.`,
    );

    if (verifyEvent) {
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
        this.logger.log(
          `Stripe request completed, id: ${id}, sessionId: ${sessionId}`,
        );
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

  @Post('/checkout/one-country/rent')
  @ApiOkResponse({
    description: 'Stripe session params',
    type: CheckoutCreateResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutOneCountryRent(@Body() dto: CheckoutOneCountryRentDto) {
    const { userAddress, params, successUrl, cancelUrl } = dto;

    this.logger.log(`Checkout oneCountry rent request: ${JSON.stringify(dto)}`);

    const serviceBalance = await this.web3Service.getOneCountryServiceBalance();
    const amountOne = await this.web3Service.getDomainPriceInOne(
      params.domainName,
    );
    this.logger.log(
      `Service balance: ${serviceBalance}, domain price: ${amountOne}`,
    );

    if (serviceBalance <= amountOne) {
      throw new InternalServerErrorException(
        `Insufficient funds on service account balance: ${serviceBalance}, required: ${amountOne}. Please contact administrator.`,
      );
    }

    const amountUsd = await this.web3Service.getCheckoutUsdAmount(amountOne);

    const checkoutDto: CreateCheckoutSessionDto = {
      name: '1.country',
      // description: `Rent domain: ${dto.params.name}.1.country`,
      amount: +amountUsd,
      successUrl,
      cancelUrl,
    };
    const session = await this.stripeService.createCheckoutSession(checkoutDto);

    const paymentDto: CreatePaymentDto = {
      method: CheckoutMethod.rent,
      sessionId: session.id,
      userAddress,
      amountUsd,
      amountOne,
      params,
    };

    await this.stripeService.savePayment(paymentDto);

    this.logger.log(
      `Created new payment session: ${session.id}, dto: ${JSON.stringify(dto)}`,
    );

    return {
      amountUsd,
      amountOne,
      sessionId: session.id,
      paymentUrl: session.url,
    };
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
    const data = await this.stripeService.getPayments(dto);
    return data;
  }
}
