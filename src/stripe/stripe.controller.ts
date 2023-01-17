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
import { PaymentStatus } from '../typeorm/payments.entity';
import { UserService } from '../user/user.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

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
      stripeCheckoutDto.mode,
    );
    await this.stripeService.saveStripeSession(session);
    res.redirect(303, session.url);
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
    this.logger.log(`Received event id: ${body.id}, type: ${body.type}`);

    if (body.type === 'checkout.session.completed') {
      const sessionId = body.data.object.id;
      this.logger.log(
        `Stripe request completed: ${body.id}, sessionId: ${sessionId}`,
      );
      const payment = await this.stripeService.getPaymentBySessionId(sessionId);
      if (payment) {
        await this.stripeService.setPaymentStatus(
          sessionId,
          PaymentStatus.completed,
        );
        await this.userService.subscribe({
          ownerAddress: payment.ownerAddress,
          subscriberAddress: payment.subscriberAddress,
        });
      } else {
        this.logger.error(
          `Cannot find payment with sessionId = "${sessionId}"`,
        );
      }
    }

    // Test request to contract
    // const price = await this.web3Service.getPriceByName('all');
    // this.logger.log(`Test price: ${price}`);
  }
}
