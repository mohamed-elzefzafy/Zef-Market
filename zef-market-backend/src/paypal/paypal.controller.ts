import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { OrderService } from 'src/order/order.service';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { Roles } from 'src/auth/decorator/Roles.decorator';

@Controller('api/v1/paypal')
export class PaypalController {
  constructor(
    private readonly paypalService: PaypalService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  /**
   * إنشاء أوردر جديد في PayPal
   * بيرجعلك redirectUrl علشان تعمل redirect للمستخدم عليه
   */
  // @Post('create-order')
  // @UseGuards(AuthGuard)
  // async createPaypalOrder(@CurrentUser() user: JwtPayloadType) {
  //   // نخلي الحسابات كلها تحصل في OrderService
  //   const paypalOrder = await this.orderService.createOrder(
  //     { paymentMethodType: 'paypal' }, // DTO
  //     user.id,
  //   );

  //   return paypalOrder; // هيرجع فيه { redirectUrl }
  // }

  @Post('create-order')
  @UseGuards(AuthGuard)
  async createPaypalOrder(@CurrentUser() user: JwtPayloadType) {
    // هنا ممكن تجيب المجموع من الـ cart في الـ service
    const paypalOrder = await this.paypalService.createOrderCheckoutSession({
      cart: [], // لو عايز تحسب cart فعلي مرره هنا
      userId: user.id,
      totalOrderPrice: 100, // قيم تجريبية
      totalOrderPriceAfterDiscount: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
    });

    return {
      redirectUrl: paypalOrder.redirectUrl,
      orderId: paypalOrder.orderId,
    };
  }

  /**
   * بعد ما العميل يوافق على الدفع
   * PayPal هيعمل redirect على الـ return_url ومعاه orderId + PayerID
   * هنا بنعمل capture للـ order ونخزن في DB
   */
  @Post('capture/:paypalOrderId')
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  @UseGuards(AuthGuard)
  async capturePaypalOrder(
    @Param('paypalOrderId') paypalOrderId: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.paypalService.captureOrder(paypalOrderId, user.id);
  }
}
