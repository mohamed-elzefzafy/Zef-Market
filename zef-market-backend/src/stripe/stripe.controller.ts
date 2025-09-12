import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { CreateSessionRequestDto } from './dto/create-session.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { StripeService } from './stripe.service';

@Controller('api/v1/checkout')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
// @Post("session")
// @Roles([ UserRoles.USER])
// @UseGuards(AuthGuard)
// async createSession(
//   @Body() createSessionRequestDto: CreateSessionRequestDto,
//   @CurrentUser() user: JwtPayloadType
// ) {
//   return this.stripeService.createSession(createSessionRequestDto.courseId, user.id);
// }

  // @Post('webhook')
  // // @UseGuards(JwtAuthGuard)
  // async handleCheckoutWebhook(
  //   @Body() evevt: any,
  // ) {
  //   return this.stripeService.handleCheckoutWebhook(evevt);
  // }


//   @Post('webhook')
// async handleCheckoutWebhook(@Body() event: any) {
//   return this.stripeService.handleCheckoutWebhook(event);
// }

@Post('webhook')
async  handleCheckoutWebhook(
    @Headers('stripe-signature') sig,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const endpointSecret =
      'whsec_9071797b87d9c3434023a7233b06d394676bb717df8b89a4364d7aaa235da50c';

    const payload = request.rawBody;

    // return this.orderService.updatePaidCard(payload, sig, endpointSecret);
     return this.stripeService.handleCheckoutWebhook(request);
    
  }
}

