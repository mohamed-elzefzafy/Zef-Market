import { Body, Controller,  Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('api/v1/checkout')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @Post('webhook')
  // @UseGuards(JwtAuthGuard)
  async handleCheckoutWebhook(
    @Body() evevt: any,
  ) {
    return this.stripeService.handleCheckoutWebhook(evevt);
  }
}



