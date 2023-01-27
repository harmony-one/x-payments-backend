import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import {
  CheckoutOneCountryRentDto,
  CheckoutVideoPayDto,
  CreateCheckoutSessionDto,
  StripeCheckoutDto,
} from './dto/checkout.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Web3Service } from '../web3/web3.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfigService } from '@nestjs/config';
import {
  StripeProduct,
  StripeProductOpType,
} from '../typeorm/stripe.payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';

@ApiTags('stripe')
@Controller('/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly web3Service: Web3Service,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ deprecated: true })
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

  @ApiOperation({ deprecated: true })
  @Post('/create-payment-intent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    const paymentIntent = await this.stripeService.createPaymentIntent(dto);
    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  @Post('/webhook')
  @UsePipes(new ValidationPipe({ transform: true }))
  async stripeWebHook(@Headers('stripe-signature') sig, @Body() body) {
    // const event = this.stripeService.verifyEvent(req.body, sig);
    // if (!event) {
    //   console.log('error');
    // } else {
    //   console.log('verified');
    // }

    this.logger.log(
      `Received Stripe webhook event id: ${body.id}, type: ${body.type}`,
    );

    if (body.type === 'checkout.session.completed') {
      const sessionId = body.data.object.id;
      this.logger.log(
        `Stripe request completed, id: ${body.id}, sessionId: ${sessionId}`,
      );
      this.stripeService.onCheckoutPaymentSuccess(sessionId);
    }
  }

  @Post('/checkout/one-country/rent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutOneCountryRent(@Body() dto: CheckoutOneCountryRentDto) {
    const checkoutDto: CreateCheckoutSessionDto = {
      name: '1.country',
      // description: `Rent ${dto.params.name} domain`,
      amount: dto.amount,
      successUrl: dto.successUrl,
      cancelUrl: dto.successUrl,
    };
    const session = await this.stripeService.createCheckoutSession(checkoutDto);

    const paymentDto: CreatePaymentDto = {
      product: StripeProduct.oneCountry,
      opType: StripeProductOpType.rent,
      sessionId: session.id,
      userAddress: dto.userAddress,
      amount: dto.amount,
      params: dto.params,
    };
    await this.stripeService.createStripePayment(paymentDto);
    this.logger.log(
      `${StripeProduct.shortReelsVideos} - created new payment session: ${
        session.id
      }, dto: ${JSON.stringify(dto)}`,
    );
    return session.url;
  }

  @Post('/checkout/video/pay')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutVideoPay(@Body() dto: CheckoutVideoPayDto) {
    const checkoutDto: CreateCheckoutSessionDto = {
      name: 'Video pay',
      amount: dto.amount,
      successUrl: dto.successUrl,
      cancelUrl: dto.successUrl,
    };
    const session = await this.stripeService.createCheckoutSession(checkoutDto);

    const paymentDto: CreatePaymentDto = {
      product: StripeProduct.shortReelsVideos,
      opType: StripeProductOpType.videoPay,
      sessionId: session.id,
      userAddress: '',
      amount: dto.amount,
      params: dto.params,
    };

    await this.stripeService.createStripePayment(paymentDto);

    this.logger.log(
      `${StripeProduct.shortReelsVideos} - created new payment session: ${
        session.id
      }, dto: ${JSON.stringify(dto)}`,
    );
    return session.url;
  }
}
