// import { Controller, Post, Body } from '@nestjs/common';
// import { PaymobService } from './paymob.service';

// @Controller('api/v1/paymob')
// export class PaymobController {
//   constructor(private paymobService: PaymobService) {}

//   @Post('checkout')
//   async checkout(@Body() body: { amount: number; orderId: string }) {
//     return this.paymobService.createOrderCheckoutSession(body.amount);
//   }
// }



import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { PaymobService } from './paymob.service';

@Controller('api/v1/paymob')
export class PaymobController {
  constructor(private readonly paymobService: PaymobService) {}

  // @Post('checkout')
  // async checkout(@Body() body: { amount: number; orderId: string }) {
  //   return this.paymobService.createOrderCheckoutSession(body.amount, body.orderId);
  // }

  @Get('webhook')
  async handleWebhook(@Body() payload: any, @Req() req: any) {
    return this.paymobService.handleWebhook(payload);
  }
}
