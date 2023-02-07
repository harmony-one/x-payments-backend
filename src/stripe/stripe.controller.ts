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
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import {
  CheckoutCreateResponseDto,
  CheckoutOneCountryRentDto,
  CheckoutVideoPayDto,
  CreateCheckoutSessionDto,
  StripeCheckoutDto,
} from './dto/checkout.dto';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Web3Service } from '../web3/web3.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfigService } from '@nestjs/config';
import {
  PaymentStatus,
  StripePaymentEntity,
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async stripeWebHook(@Headers('stripe-signature') sig, @Body() body) {
    // const event = this.stripeService.verifyEvent(req.body, sig);
    // if (!event) {
    //   console.log('error');
    // } else {
    //   console.log('verified');
    // }

    const { id, type } = body;
    this.logger.log(`Received Stripe webhook event id: ${id}, type: ${type}`);

    if (type === 'checkout.session.completed') {
      const sessionId = body.data.object.id;
      this.logger.log(
        `Stripe request completed, id: ${id}, sessionId: ${sessionId}`,
      );
      this.stripeService.onCheckoutPaymentSuccess(sessionId);
    } else if (type === 'checkout.session.expired') {
      const sessionId = body.data.object.id;
      await this.stripeService.setPaymentStatus(
        sessionId,
        PaymentStatus.expired,
      );
    }
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
    const domainPrice = await this.web3Service.getDomainPriceInOne(params.name);
    this.logger.log(
      `Service balance: ${serviceBalance}, domain price: ${domainPrice}`,
    );

    if (serviceBalance <= domainPrice) {
      throw new InternalServerErrorException(
        `Insufficient funds on service account balance: ${serviceBalance}, required: ${domainPrice}. Please contract administrator.`,
      );
    }

    const oneTokenPrice = await this.web3Service.getTokenPriceById('harmony');
    const amount = Math.round(
      (+domainPrice / Math.pow(10, 18)) * oneTokenPrice * 100,
    );
    const checkoutDto: CreateCheckoutSessionDto = {
      name: '1.country',
      // description: `Rent domain: ${dto.params.name}.1.country`,
      amount,
      successUrl,
      cancelUrl,
    };
    const session = await this.stripeService.createCheckoutSession(checkoutDto);

    const paymentDto: CreatePaymentDto = {
      product: StripeProduct.oneCountry,
      opType: StripeProductOpType.rent,
      sessionId: session.id,
      userAddress,
      amount,
      params: dto.params,
    };
    await this.stripeService.createStripePayment(paymentDto);

    this.logger.log(
      `${StripeProduct.oneCountry}: created new payment session: ${
        session.id
      }, dto: ${JSON.stringify(dto)}`,
    );

    return {
      amount,
      sessionId: session.id,
      paymentUrl: session.url,
    };
  }

  @Post('/checkout/video/pay')
  @ApiOkResponse({
    description: 'Stripe session params',
    type: CheckoutCreateResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutVideoPay(
    @Body() dto: CheckoutVideoPayDto,
  ): Promise<CheckoutCreateResponseDto> {
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
      `${StripeProduct.shortReelsVideos}: created new payment session: ${
        session.id
      }, dto: ${JSON.stringify(dto)}`,
    );

    return {
      amount: dto.amount,
      sessionId: session.id,
      paymentUrl: session.url,
    };
  }

  @Get('/payment/:sessionId')
  @ApiParam({
    name: 'sessionId',
    required: true,
    description: 'Stripe sessionId obtained by calling /checkout/ method',
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
}
