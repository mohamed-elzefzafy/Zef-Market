// import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { CreateSessionRequestDto } from './dto/create-session.dto';
// import { StripeService } from './stripe.service';
// import { AuthGuard } from 'src/auth/guards/auth.guard';
// import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
// import { JwtPayloadType } from 'src/shared/types';
// import { Roles } from 'src/auth/decorator/Roles.decorator';
// import { UserRoles } from 'src/shared/enums/roles.enum';

// @Controller('v1/checkout')
// export class StripeController {
//   constructor(private readonly stripeService: StripeService) {}
// @Post("session")
// @Roles([UserRoles.INSTRUCTOR , UserRoles.USER])
// @UseGuards(AuthGuard)
// async createSession(
//   @Body() createSessionRequestDto: CreateSessionRequestDto,
//   @CurrentUser() user: JwtPayloadType
// ) {
//   return this.stripeService.createSession(createSessionRequestDto.courseId, user.id);
// }

//   @Post('webhook')
//   // @UseGuards(JwtAuthGuard)
//   async handleCheckoutWebhook(
//     @Body() evevt: any,
//   ) {
//     return this.stripeService.handleCheckoutWebhook(evevt);
//   }
// }
