import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
  Headers,
  Req,
  Logger,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeCheckoutDto } from './dto/checkout.dto';
import { ApiTags } from '@nestjs/swagger';
import { Web3Service } from '../web3/web3.service';
import { UserService } from '../user/user.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CheckoutOneCountryDto } from './dto/checkout.onecountry.dto';
import { SubscriptionStatus } from '../typeorm/subscription.entity';

@ApiTags('stripe')
@Controller('/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly web3Service: Web3Service,
    private readonly userService: UserService,
  ) {}

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

  @Post('/checkout-one-country')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkoutOneCountry(@Body() dto: CheckoutOneCountryDto) {
    const session = await this.stripeService.createStripeSessionOneCountry(dto);
    await this.stripeService.createSubscription(dto, session.id);
    return session.url;
  }

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
  async stripeWebHook(
    @Headers('stripe-signature') sig,
    @Body() body,
    @Res() res,
    @Req() req,
  ) {
    // const event = this.stripeService.verifyEvent(req.body, sig);
    // if (!event) {
    //   console.log('error!');
    // } else {
    //   console.log('verified!');
    // }
    this.logger.log(
      `Received Stripe webhook event id: ${body.id}, type: ${body.type}`,
    );

    if (body.type === 'checkout.session.completed') {
      const sessionId = body.data.object.id;
      this.logger.log(
        `Stripe request completed: ${body.id}, sessionId: ${sessionId}`,
      );
      const subscription = await this.stripeService.getSubscriptionBySessionId(
        sessionId,
      );
      if (subscription) {
        const { name, url, amountOne, telegram, email, phone, userAddress } =
          subscription;
        await this.stripeService.setSubscriptionStatus(
          sessionId,
          SubscriptionStatus.paid,
        );
        const currentOnePrice = await this.web3Service.getDomainPriceByName(
          subscription.name,
        );
        this.logger.log(
          `Domain ${name} current price: ${currentOnePrice}, expected price: ${amountOne}`,
        );
        const rentTx = await this.web3Service.rent(
          name,
          url,
          currentOnePrice,
          telegram,
          email,
          phone,
        );

        this.logger.log(
          `Domain ${name} rented by BE, tx id: ${rentTx.transactionHash}`,
        );

        await this.stripeService.setSubscriptionStatus(
          sessionId,
          SubscriptionStatus.rented,
        );

        await new Promise((resolve) => setTimeout(resolve, 4000));

        const transferTx = await this.web3Service.transferToken(
          userAddress,
          name,
        );

        this.logger.log(
          `Domain ${name} transferred from BE to user address ${userAddress}, tx id: ${transferTx.transactionHash}`,
        );

        await this.stripeService.setSubscriptionStatus(
          sessionId,
          SubscriptionStatus.completed,
        );
      } else {
        this.logger.error(
          `Cannot find subscription with sessionId = "${sessionId}"`,
        );
      }
    }
  }
}
