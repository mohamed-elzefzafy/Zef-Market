import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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


  @Post('webhook')
async handleCheckoutWebhook(@Body() event: any) {
  return this.stripeService.handleCheckoutWebhook(event);
}
}