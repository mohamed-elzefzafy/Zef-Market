import { Controller, Post, Body } from '@nestjs/common';
import { PaymobService } from './paymob.service';

@Controller('paymob')
export class PaymobController {
  constructor(private paymobService: PaymobService) {}

  @Post('checkout')
  async checkout(@Body() body: { amount: number; orderId: string }) {
    return this.paymobService.createOrderCheckoutSession(body.amount);
  }
}



// import { Controller, Post, Body, Get, Query } from '@nestjs/common';
// import { PaymobService } from './paymob.service';

// @Controller('paymob')
// export class PaymobController {
//   constructor(private readonly paymobService: PaymobService) {}

//   @Post('create-checkout')
//   async createCheckout(
//     @Body()
//     body: {
//       cart: any;
//       userId: string;
//       totalOrderPrice: number;
//       totalOrderPriceAfterDiscount: number;
//       discount: number;
//       tax: number;
//       shipping: number;
//     },
//   ) {
//     return this.paymobService.createOrderCheckoutSession(
//       body.cart,
//       body.userId,
//       body.totalOrderPrice,
//       body.totalOrderPriceAfterDiscount,
//       body.discount,
//       body.tax,
//       body.shipping,
//     );
//   }

//   @Get('callback')
//   async handleCallback(@Query() query: any) {
//     return this.paymobService.handlePaymentCallback(query);
//   }
// }