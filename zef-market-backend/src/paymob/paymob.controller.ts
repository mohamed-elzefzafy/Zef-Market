// import { Controller, Post, Get, Body, Query } from '@nestjs/common';
// import { PaymobService } from './paymob.service';

// @Controller('api/v1/paymob')
// export class PaymobController {
//   constructor(private readonly paymobService: PaymobService) {}

//   // === 1️⃣ إنشاء جلسة الدفع ===
//   @Post('checkout')
//   async checkout(@Body() body: { amount: number; orderId: string }) {
//     const paymobOrder = await this.paymobService.createOrderCheckoutSession(
//       body.amount,
//       body.orderId,
//     );

//     return {
//       url: paymobOrder.iframeUrl,
//       orderId: paymobOrder.orderId,
//       paymentMethodType: 'paymob',
//     };
//   }

//   // === 2️⃣ Webhook لمعالجة الدفع بعد Paymob ===
// @Get('webhook')
// async handleWebhookGet(@Query() query: any) {
//   console.log('Paymob Webhook received (GET):', query);

//   await this.paymobService.handleWebhook(query); // استعمل query بدل body

//   return { received: true };
// }


// //   @Get('webhook')
// //   async handleWebhook(@Body() payload: any, @Req() req: any) {
// //     return this.paymobService.handleWebhook(payload);
// //   }
// // }



//   // === 3️⃣ Redirect بعد الدفع للـ user (اختياري) ===
//   @Get('checkout-success')
//   async checkoutSuccess(@Query() query: any) {
//     console.log('🔹 User returned after payment:', query);

//     // ممكن تعرض صفحة شكراً أو حالة الدفع
//     return {
//       message: 'Payment completed, you can now check your order.',
//       query,
//     };
//   }
// }



import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { PaymobService } from './paymob.service';

@Controller('api/v1/paymob')
export class PaymobController {
  constructor(private readonly paymobService: PaymobService) {}

  // === 1️⃣ إنشاء جلسة الدفع ===
  @Post('checkout')
  async checkout(
    @Body() body: { amount: number; orderId: string; userId: string },
  ) {
    const paymobOrder = await this.paymobService.createOrderCheckoutSession(
      body.amount,
      body.orderId,
      body.userId,
    );

    return {
      url: paymobOrder.iframeUrl,
      orderId: paymobOrder.orderId,
      paymentMethodType: 'paymob',
    };
  }

  // === 2️⃣ Webhook الرسمي من Paymob (POST) ===
  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Req() req: any) {
    console.log('🔔 Paymob Webhook (POST) received');
    return this.paymobService.handleWebhook(payload);
  }

  @Get('webhook')
getWebhookRedirect(@Query() query: any) {
  console.log('User redirected after payment:', query);
  return {
    message: '✅ Redirect received after payment',
    query,
  };
}

  // === 3️⃣ صفحة النجاح بعد الدفع ===
  @Get('checkout-success')
  async checkoutSuccess(@Query() query: any) {
    return {
      message: '✅ Payment completed successfully!',
      query,
    };
  }

  // === 4️⃣ صفحة الفشل بعد الدفع ===
  @Get('checkout-failed')
  async checkoutFailed(@Query() query: any) {
    return {
      message: '❌ Payment failed or cancelled.',
      query,
    };
  }
}
