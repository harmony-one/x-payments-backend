import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeCheckoutDto } from './dto/checkout.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private configService: ConfigService) {
    const stripeSecretKey = configService.get('stripe.secretKey');
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });
  }
  async createStripeSession(dto: StripeCheckoutDto) {
    const { mode } = dto;

    const clientUrl = this.configService.get('oneCountry.clientUrl');
    const priceId = this.configService.get('stripe.priceId');

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: priceId,
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
