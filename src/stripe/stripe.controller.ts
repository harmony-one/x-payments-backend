import {
  Controller,
  Get,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeCheckoutDto } from './dto/checkout.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('stripe')
@Controller('/stripe')
export class StripeController {
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
}
