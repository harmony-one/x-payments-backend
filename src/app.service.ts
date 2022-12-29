import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeCheckoutDto } from './dto/checkout.dto';

@Injectable()
export class AppService {
  private stripe: Stripe;
  constructor(private configService: ConfigService) {
    const stripeSecretKey = configService.get('stripeSecretKey');
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });
  }
  async creeateStripeSession(dto: StripeCheckoutDto) {
    const clientUrl = this.configService.get('oneCountryClientUrl');
    const stripePriceId = this.configService.get('stripePriceId');
    const { mode } = dto;

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${clientUrl}?success=true`,
      cancel_url: `${clientUrl}?canceled=true`,
    });
    return session;
  }
}
