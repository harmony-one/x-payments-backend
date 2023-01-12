import {
  Controller,
  Get,
  Logger,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserSubscribeDto } from './dto/user.subscribe.dto';
import { ApiTags } from '@nestjs/swagger';
import { StripeService } from '../stripe/stripe.service';
import { StripeMode } from '../stripe/dto/checkout.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private readonly userService: UserService,
    private readonly stripeService: StripeService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('/subscribe')
  async subscribe(@Res() res, @Query() dto: UserSubscribeDto) {
    const { ownerAddress, subscriberAddress } = dto;

    // if (ownerAddress === subscriberAddress) {
    //   throw new BadRequestException(
    //     'subscriberAddress should be different from ownerAddress',
    //   );
    // }

    const isUserSubscribed = await this.userService.isUserSubscribed(
      ownerAddress,
      subscriberAddress,
    );
    if (isUserSubscribed) {
      // throw new BadRequestException('User already subscribed');
    }

    const session = await this.stripeService.createStripeSession(
      StripeMode.payment,
    );

    await this.stripeService.createPayment(
      session.id,
      ownerAddress,
      subscriberAddress,
    );

    // await this.userService.subscribe(dto);

    res.redirect(303, session.url);
  }
}
