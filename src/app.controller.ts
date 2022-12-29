import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { StripeCheckoutDto } from './dto/checkout.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/checkout')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCheckoutSession(
    @Res() res,
    @Query() stripeCheckoutDto: StripeCheckoutDto,
  ) {
    const session = await this.appService.creeateStripeSession(
      stripeCheckoutDto,
    );
    res.redirect(303, session.url);
  }
}
