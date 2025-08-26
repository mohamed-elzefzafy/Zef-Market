import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionRequestDto } from './dto/create-session.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CartService } from 'src/cart/cart.service';
import { OrderService } from 'src/order/order.service';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from 'src/order/entities/order.schema';
import { Model, Types } from 'mongoose';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class StripeService {
  constructor(
    private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
      @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    // private readonly orderService: OrderService,
  ) {}
//   public async createSession(courseId: string, userId: string) {
//     const course = await this.courseService.findOneWithoutpopulate(courseId);
  
// // if (course.isFree) {
// // if (!course.users.includes(userId)) {
// //   course.users.push(userId);
// //   await course.save();
// //   return {message :`you have subscribed to ${course.title} cousre`}
// // } else {
// //     return {message :`you already subscribed to ${course.title} cousre`}
// // }
// // }
//     return this.stripe.checkout.sessions.create({
//       metadata: {
//         courseId,
//         userId,
//       },
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             unit_amount: course.finalPrice * 100,
//             product_data: {
//               name: course.title,
//               description: course.description,
//               images: [course.thumbnail.url],
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: `${this.configService.getOrThrow('STRIPE_SUCCESS_URL')}/course/${courseId}`,
//       cancel_url:   this.configService.getOrThrow('STRIPE_CANCEL_URL'),
//     });
//   }
// async handleCheckoutWebhook(event: any) {
//   console.log(event);

//   if (event.type !== 'checkout.session.completed') return;

//   const session = await this.stripe.checkout.sessions.retrieve(
//     event.data.object.id
//   );

//   const metadata = session.metadata;

//   if (!metadata || !metadata.courseId || !metadata.userId) {
//     throw new NotFoundException("Missing session metadata (courseId/userId)");
//   }
// console.log("ggggggggggggggggggggggg");

//   // ✅ مرر userId مباشرة
//   // await this.courseService.updateCheckOut(metadata.courseId, metadata.userId );
// }


async createOrderCheckoutSession(
  cart: any,
  userId: string,
  totalOrderPrice: number,
  totalOrderPriceAfterDiscount: number,
  discount: number,
  tax: number,
  shipping: number,
) {
  return this.stripe.checkout.sessions.create({
    metadata: {
      userId,
      cartId: cart._id.toString(),
      totalOrderPrice: totalOrderPrice.toString(),
      totalOrderPriceAfterDiscount: totalOrderPriceAfterDiscount.toString(),
      discount: discount.toString(),
      tax: tax.toString(),
      shipping: shipping.toString(),
    },
    line_items: cart.cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Number(item.finalPrice) * 100,
        product_data: {
          name: item.productId.title,
          description: item.productId.description,
        },
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
    cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
  });
}

async handleCheckoutWebhook(event: any) {
  if (event.type !== 'checkout.session.completed') return;

  const session = await this.stripe.checkout.sessions.retrieve(
    event.data.object.id,
  );

  const metadata = session.metadata;
  if (!metadata?.userId || !metadata?.cartId) {
    throw new NotFoundException('Missing session metadata');
  }

  // هات الكارت تاني
  const cart = await this.cartService.getOrderCart(metadata.userId);

  // أنشئ الأوردر بعد الدفع
  const order = await this.orderModel.create({
    user: new Types.ObjectId(metadata.userId),
    orderItems: cart.cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      finalPrice: item.finalPrice,
    })),
    totalOrderPrice: Number(metadata.totalOrderPrice),
    totalOrderPriceAfterDiscount: Number(metadata.totalOrderPriceAfterDiscount),
    discount: Number(metadata.discount),
    tax: Number(metadata.tax),
    shipping: Number(metadata.shipping),
    paymentMethodType: 'card',
    isPaid: true,
  });

  // خصم من المخزون
  for (const item of cart.cartItems) {
    await this.productsService.updateProductForOrder(
      item.productId._id.toString(),
      item.quantity,
    );
  }

  // امسح الكارت
  cart.cartItems = [];
  cart.totalPrice = 0;
  cart.totalPriceAfterDiscount = 0;
  cart.coupons = [];
  await cart.save();

  return order;
}

}
