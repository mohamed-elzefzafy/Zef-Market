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

import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { OrderService } from 'src/order/order.service';
import { Order, OrderDocument } from 'src/order/entities/order.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';

@Controller('api/v1/paymob')
export class PaymobController {
  constructor(
    private readonly paymobService: PaymobService,
    private readonly orderService: OrderService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // === 1️⃣ إنشاء جلسة الدفع ===
  //   @Post('checkout')
  //   async checkout(@Body() body: { amount: number; orderId: string }) {
  //     // const paymobOrder = await this.paymobService.createOrderCheckoutSession(
  //     //   body.amount,
  //     //   body.orderId,
  //     // );

  // //     const paymobOrder = await this.paymobService.createOrderCheckoutSession(
  // //  body.amount,
  // //       body.orderId,
  // //   userId // ← لازم تبعته
  // // );

  // const paymobOrder = await this.paymobService.createOrderCheckoutSession(
  //  body.amount,
  //       body.orderId,
  //   userId // ← هنا جاي من الـ DTO بتاع الطلب
  // );

  //     return {
  //       url: paymobOrder.iframeUrl,
  //       orderId: paymobOrder.orderId,
  //       paymentMethodType: 'paymob',
  //     };
  //   }

  @Post('checkout')
  @UseGuards(AuthGuard) // لو عندك authentication
  async checkout(
    @Body() body: { amount: number; orderId: string },
    @CurrentUser() user: JwtPayloadType, // هنا هياخد الـ user اللي عامل الطلب
  ) {
    const userId = user.id; // ده الـ userId

    const paymobOrder = await this.paymobService.createOrderCheckoutSession(
      body.amount,
      body.orderId,
      userId,
    );

    return {
      url: paymobOrder.iframeUrl,
      orderId: paymobOrder.orderId,
      paymentMethodType: 'paymob',
    };
  }

  // === 2️⃣ Webhook لمعالجة الدفع بعد Paymob ===
  // @Get('webhook')
  // async handleWebhookGet(@Query() query: any) {
  //   console.log('Paymob Webhook received (GET):', query);

  //   await this.paymobService.handleWebhook(query); // استعمل query بدل body

  //   return { received: true };
  // }

  // @Get('webhook')
  // async handleWebhook(@Query() query: any, @Body() payload: any) {
  //   console.log('Paymob Webhook received:', payload);

  //   const userId = payload?.order?.metadata?.userId; // خد الـ userId من metadata
  //   const merchantOrderId = payload.merchant_order_id;

  //   if (payload.success === 'true') {
  //     console.log('✅ Payment success for order:', merchantOrderId);

  //     // أنشئ الأوردر النهائي باستخدام بيانات الكارت
  //     await this.orderService.createOrderDependOnPaymentMethod(userId, 'paymob', merchantOrderId);
  //   } else {
  //     console.log('❌ Payment failed:', payload);
  //   }

  //   return { received: true };
  // }

  @Get('webhook')
  async handleWebhook(@Query() query: any) {
    const merchantOrderId = query.merchant_order_id;

    // جب الأوردر من الـ database
    const order = await this.orderModel.findById(merchantOrderId);
    if (!order) return { received: true };

    const userId = order.user.toString(); // هنا حصلنا على userId

    // استخدمه دلوقتي
    await this.orderService.createOrderDependOnPaymentMethod(
      userId,
      'paymob',
      merchantOrderId,
    );

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
