
// import { Controller, Post, Body, Req, Get } from '@nestjs/common';
// import { PaymobService } from './paymob.service';

// @Controller('api/v1/paymob')
// export class PaymobController {
//   constructor(private readonly paymobService: PaymobService) {}

//   // @Post('checkout')
//   // async checkout(@Body() body: { amount: number; orderId: string }) {
//   //   return this.paymobService.createOrderCheckoutSession(body.amount, body.orderId);
//   // }

//   @Get('webhook')
//   async handleWebhook(@Body() payload: any, @Req() req: any) {
//     return this.paymobService.handleWebhook(payload);
//   }
// }



import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { PaymobService } from './paymob.service';

@Controller('api/v1/paymob')
export class PaymobController {
  constructor(private readonly paymobService: PaymobService) {}

  // === 1️⃣ إنشاء جلسة الدفع ===
  @Post('checkout')
  async checkout(@Body() body: { amount: number; orderId: string }) {
    const paymobOrder = await this.paymobService.createOrderCheckoutSession(
      body.amount,
      body.orderId,
    );

    return {
      url: paymobOrder.iframeUrl,
      orderId: paymobOrder.orderId,
      paymentMethodType: 'paymob',
    };
  }

  // === 2️⃣ Webhook لمعالجة الدفع بعد Paymob ===
  @Post('webhook') // لازم POST في dashboard Paymob
  async handleWebhook(@Body() payload: any) {
    console.log('✅ Paymob Webhook received (POST):', payload);

    await this.paymobService.handleWebhook(payload);

    return { received: true };
  }

  // === 3️⃣ Redirect بعد الدفع للـ user (اختياري) ===
  @Get('checkout-success')
  async checkoutSuccess(@Query() query: any) {
    console.log('🔹 User returned after payment:', query);

    // ممكن تعرض صفحة شكراً أو حالة الدفع
    return {
      message: 'Payment completed, you can now check your order.',
      query,
    };
  }
}
