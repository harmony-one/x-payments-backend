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
@ApiTags('stripe')
@Controller('/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(private readonly stipeService: StripeService) {}

  @Get('/checkout')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCheckoutSession(
    @Res() res,
    @Query() stripeCheckoutDto: StripeCheckoutDto,
  ) {
    const session = await this.stipeService.createStripeSession(
      stripeCheckoutDto,
    );
    res.redirect(303, session.url);
  }

  @Post('/webhook')
  @UsePipes(new ValidationPipe({ transform: true }))
  async stripeWebHook(
    @Headers('stripe-signature') sig,
    @Body() body,
    @Res() res,
    @Req() req,
  ) {
    // const event = this.stipeService.verifyEvent(req.body, sig);
    // if (!event) {
    //   console.log('error!');
    // } else {
    //   console.log('verified!');
    // }
    if (body.type === 'checkout.session.completed') {
      this.logger.log(`Stripe request completed: ${body.id}`);
    }
  }
}
