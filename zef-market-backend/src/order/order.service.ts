import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from 'src/cart/cart.service';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.schema';
import { Model, Types } from 'mongoose';
import { ProductsService } from 'src/products/products.service';
import { CouponService } from 'src/coupon/coupon.service';
import { TaxAndShippingService } from 'src/taxAndShipping/taxAndShipping.service';
import { StripeService } from 'src/stripe/stripe.service';
import { UsersService } from 'src/users/users.service';
import { PaypalService } from 'src/paypal/paypal.service';
import axios from 'axios';
import { PaymobService } from 'src/paymob/paymob.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly couponService: CouponService,
    private readonly taxAndShippingService: TaxAndShippingService,
    private readonly stripeService: StripeService,
      @Inject(forwardRef(() => PaypalService))
    private readonly paypalService: PaypalService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => PaymobService))
    private readonly paymobService: PaymobService,
  ) {}
//   async createOrder(createOrderDto: CreateOrderDto, userId: string) {
//   const cart = await this.cartService.getOrderCart(userId);

//   if (cart.cartItems.length === 0) {
//     throw new BadRequestException('Cart is empty');
//   }

//   const user = await this.usersService.findOne(userId);
//   if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//     throw new BadRequestException("please complete your address data to reach you successfully");
//   }

//   let totalOrderPrice = 0;

//   for (const item of cart.cartItems) {
//     const product = await this.productsService.checkProductsForOrder(
//       item.productId._id.toString(),
//       item.quantity,
//     );

//     if (!product) {
//       throw new BadRequestException(
//         `Product with id ${item.productId._id} no longer exists`,
//       );
//     }

//     if (product.price !== item.price) {
//       throw new BadRequestException(
//         `Price changed for product ${product.title}`,
//       );
//     }

//     if (product.stock < item.quantity) {
//       throw new BadRequestException(
//         `Not enough stock for product ${product.title}`,
//       );
//     }

//     totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
//   }

//   // حساب الخصومات + الضريبة + الشحن
//   let discount = 0;
//   if (cart.coupons?.length > 0) {
//     for (const c of cart.coupons) {
//       const coupon = await this.couponService.findOneById(c._id.toString());
//       if (coupon?.discount) {
//         discount += coupon.discount;
//       }
//     }
//   }

//   const taxAndShipping = await this.taxAndShippingService.findAll();
//   const tax = taxAndShipping?.taxRate ?? 0;
//   const shipping = taxAndShipping?.shippingPrice ?? 0;

//   const totalOrderPriceAfterDiscount =
//     totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

//   // ⬇️ لو كاش → أنشئ الأوردر فوراً
//   if (createOrderDto.paymentMethodType === 'cash') {
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//       paymentMethodType: 'cash',
//     });

//     // خصم من المخزون
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // امسح الكارت
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }

//   // ✅ Stripe
//   if (createOrderDto.paymentMethodType === 'stripe') {
//     return this.stripeService.createOrderCheckoutSession(
//       cart,
//       userId,
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//     );
//   }


  
//   // 🔵 PayPal
// if (createOrderDto.paymentMethodType === 'paypal') {
//   const paypalOrder = await this.paypalService.createOrderCheckoutSession({
//     cart,
//     userId,
//     totalOrderPrice,
//     totalOrderPriceAfterDiscount,
//     discount,
//     tax,
//     shipping,
//   });

//   return {
//     redirectUrl: paypalOrder.redirectUrl,
//     orderId: paypalOrder.orderId, // ✅ هنا orderId مش id
//   };
// }

//     // 🟣 Paymob
//     // if (createOrderDto.paymentMethodType === 'paymob') {
//     //   return this.paymobService.createOrder(
//     //     cart,
//     //     userId,
//     //     totalOrderPrice,
//     //     totalOrderPriceAfterDiscount,
//     //     discount,
//     //     tax,
//     //     shipping,
//     //   );
//     // }

// if (createOrderDto.paymentMethodType === 'paymob') {
//   const paymobOrder = await this.paymobService.createOrderCheckoutSession(totalOrderPrice);

//   return {
//     _id: paymobOrder.orderId,
//     url: paymobOrder.iframeUrl,
//     paymentMethodType: 'paymob',
//   };
// }
//     throw new BadRequestException('Invalid payment method type');
// }


// async createOrder(createOrderDto: CreateOrderDto, userId: string) {
//   const cart = await this.cartService.getOrderCart(userId);

//   if (cart.cartItems.length === 0) {
//     throw new BadRequestException('Cart is empty');
//   }

//   const user = await this.usersService.findOne(userId);
//   if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//     throw new BadRequestException(
//       'please complete your address data to reach you successfully',
//     );
//   }

//   let totalOrderPrice = 0;

//   for (const item of cart.cartItems) {
//     const product = await this.productsService.checkProductsForOrder(
//       item.productId._id.toString(),
//       item.quantity,
//     );

//     if (!product) {
//       throw new BadRequestException(
//         `Product with id ${item.productId._id} no longer exists`,
//       );
//     }

//     if (product.price !== item.price) {
//       throw new BadRequestException(
//         `Price changed for product ${product.title}`,
//       );
//     }

//     if (product.stock < item.quantity) {
//       throw new BadRequestException(
//         `Not enough stock for product ${product.title}`,
//       );
//     }

//     totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
//   }

//   // ✅ حساب الخصومات + الضريبة + الشحن
//   let discount = 0;
//   if (cart.coupons?.length > 0) {
//     for (const c of cart.coupons) {
//       const coupon = await this.couponService.findOneById(c._id.toString());
//       if (coupon?.discount) {
//         discount += coupon.discount;
//       }
//     }
//   }

//   const taxAndShipping = await this.taxAndShippingService.findAll();
//   const tax = taxAndShipping?.taxRate ?? 0;
//   const shipping = taxAndShipping?.shippingPrice ?? 0;

//   const totalOrderPriceAfterDiscount =
//     totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

//   // ✅ Cash
//   if (createOrderDto.paymentMethodType === 'cash') {
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//       paymentMethodType: 'cash',
//     });

//     // خصم من المخزون
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // امسح الكارت
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }

//   // ✅ Stripe
//   if (createOrderDto.paymentMethodType === 'stripe') {
//     return this.stripeService.createOrderCheckoutSession(
//       cart,
//       userId,
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//     );
//   }

//   // ✅ PayPal
//   if (createOrderDto.paymentMethodType === 'paypal') {
//     return this.paypalService.createOrderCheckoutSession(
//       cart,
//       userId,
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//     );
//   }

//   // // ✅ Paymob
//   // if (createOrderDto.paymentMethodType === 'paymob') {
//   //   return this.paymobService.createOrderCheckoutSession(
//   //     cart,
//   //     userId,
//   //     totalOrderPrice,
//   //     totalOrderPriceAfterDiscount,
//   //     discount,
//   //     tax,
//   //     shipping,
//   //   );
//   // }

//   throw new BadRequestException('Unsupported payment method');
// }



  // async createOrder(createOrderDto: CreateOrderDto, userId: string) {
  //   const cart = await this.cartService.getOrderCart(userId);

  //   if (cart.cartItems.length === 0) {
  //     throw new BadRequestException('Cart is empty');
  //   }

  //   const user = await this.usersService.findOne(userId);
  //   if (!user.country || !user.city || !user.address || !user.phoneNumber) {
  //     throw new BadRequestException(
  //       'please complete your address data to reach you successfully',
  //     );
  //   }

  //   let totalOrderPrice = 0;

  //   for (const item of cart.cartItems) {
  //     const product = await this.productsService.checkProductsForOrder(
  //       item.productId._id.toString(),
  //       item.quantity,
  //     );

  //     if (!product) {
  //       throw new BadRequestException(
  //         `Product with id ${item.productId._id} no longer exists`,
  //       );
  //     }

  //     if (product.price !== item.price) {
  //       throw new BadRequestException(
  //         `Price changed for product ${product.title}`,
  //       );
  //     }

  //     if (product.stock < item.quantity) {
  //       throw new BadRequestException(
  //         `Not enough stock for product ${product.title}`,
  //       );
  //     }

  //     totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
  //   }

  //   // حساب الخصومات + الضريبة + الشحن
  //   let discount = 0;
  //   if (cart.coupons?.length > 0) {
  //     for (const c of cart.coupons) {
  //       const coupon = await this.couponService.findOneById(c._id.toString());
  //       if (coupon?.discount) {
  //         discount += coupon.discount;
  //       }
  //     }
  //   }

  //   const taxAndShipping = await this.taxAndShippingService.findAll();
  //   const tax = taxAndShipping?.taxRate ?? 0;
  //   const shipping = taxAndShipping?.shippingPrice ?? 0;

  //   const totalOrderPriceAfterDiscount =
  //     totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

  //   // ⬇️ 1- لو كاش → أنشئ الأوردر فوراً
  //   if (createOrderDto.paymentMethodType === 'cash') {
  //     const order = await this.orderModel.create({
  //       user: new Types.ObjectId(userId),
  //       orderItems: cart.cartItems.map((item) => ({
  //         productId: item.productId,
  //         quantity: item.quantity,
  //         price: item.price,
  //         finalPrice: item.finalPrice,
  //       })),
  //       totalOrderPrice,
  //       totalOrderPriceAfterDiscount,
  //       discount,
  //       tax,
  //       shipping,
  //       paymentMethodType: 'cash',
  //     });

  //     // خصم من المخزون
  //     for (const item of cart.cartItems) {
  //       await this.productsService.updateProductForOrder(
  //         item.productId._id.toString(),
  //         item.quantity,
  //       );
  //     }

  //     // امسح الكارت
  //     cart.cartItems = [];
  //     cart.totalPrice = 0;
  //     cart.totalPriceAfterDiscount = 0;
  //     cart.coupons = [];
  //     await cart.save();

  //     return order;
  //   }

  //   // ⬇️ 2- Stripe
  //   if (createOrderDto.paymentMethodType === 'stripe') {
  //     return this.stripeService.createOrderCheckoutSession(
  //       cart,
  //       userId,
  //       totalOrderPrice,
  //       totalOrderPriceAfterDiscount,
  //       discount,
  //       tax,
  //       shipping,
  //     );
  //   }

  //   // ⬇️ 3- PayPal
  //   if (createOrderDto.paymentMethodType === 'paypal') {
  //     return this.paypalService.createOrder(totalOrderPrice, 'USD');
  //   }

  //   // // ⬇️ 4- Paymob
  //   // if (createOrderDto.paymentMethodType === 'paymob') {
  //   //   const token = await this.paymobService.authenticate();
  //   //   const order = await this.paymobService.createOrder(
  //   //     token,
  //   //     totalOrderPrice * 100, // paymob بالـ cents
  //   //     'EGP',
  //   //   );

  //   //   const paymentKey = await this.paymobService.generatePaymentKey(
  //   //     token,
  //   //     order.id,
  //   //     totalOrderPrice * 100,
  //   //     {
  //   //       first_name: user.firstName || 'Test',
  //   //       last_name: user.lastName || 'User',
  //   //       email: user.email || 'test@example.com',
  //   //       phone_number: user.phoneNumber,
  //   //       street: user.address,
  //   //       city: user.city,
  //   //       country: user.country,
  //   //     },
  //   //   );

  //   //   return this.paymobService.getPaymentUrl(paymentKey);
  //   // }

  //   throw new BadRequestException('Unsupported payment method');
  // }


//   async createOrder(createOrderDto: CreateOrderDto, userId: string) {
//   const cart = await this.cartService.getOrderCart(userId);

//   if (cart.cartItems.length === 0) {
//     throw new BadRequestException('Cart is empty');
//   }

//   const user = await this.usersService.findOne(userId);
//   if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//     throw new BadRequestException("please complete your address data to reach you successfully");
//   }

//   let totalOrderPrice = 0;

//   for (const item of cart.cartItems) {
//     const product = await this.productsService.checkProductsForOrder(
//       item.productId._id.toString(),
//       item.quantity,
//     );

//     if (!product) {
//       throw new BadRequestException(`Product ${item.productId._id} no longer exists`);
//     }

//     if (product.price !== item.price) {
//       throw new BadRequestException(`Price changed for ${product.title}`);
//     }

//     if (product.stock < item.quantity) {
//       throw new BadRequestException(`Not enough stock for ${product.title}`);
//     }

//     totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
//   }

//   // حساب الخصومات + الضريبة + الشحن
//   let discount = 0;
//   if (cart.coupons?.length > 0) {
//     for (const c of cart.coupons) {
//       const coupon = await this.couponService.findOneById(c._id.toString());
//       if (coupon?.discount) {
//         discount += coupon.discount;
//       }
//     }
//   }

//   const taxAndShipping = await this.taxAndShippingService.findAll();
//   const tax = taxAndShipping?.taxRate ?? 0;
//   const shipping = taxAndShipping?.shippingPrice ?? 0;

//   const totalOrderPriceAfterDiscount =
//     totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

//   // 🟢 Cash → إنشاء الأوردر مباشرة
//   if (createOrderDto.paymentMethodType === 'cash') {
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//       paymentMethodType: 'cash',
//       isPaid: false,
//     });

//     // خصم من المخزون
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // امسح الكارت
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }

//   // 🟠 Stripe → checkout session
//   if (createOrderDto.paymentMethodType === 'stripe') {
//     return this.stripeService.createOrderCheckoutSession(
//       cart,
//       userId,
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//     );
//   }

//   // // 🔵 PayPal → send approve URL
//   // if (createOrderDto.paymentMethodType === 'paypal') {
//   //   return this.paypalService.createOrderCheckoutSession(
//   //     cart,
//   //     userId,
//   //     totalOrderPrice,
//   //     totalOrderPriceAfterDiscount,
//   //     discount,
//   //     tax,
//   //     shipping,
//   //   );
//   // }


// //   if (createOrderDto.paymentMethodType === 'paypal') {
// //   const paypalOrder = await this.paypalService.createOrderCheckoutSession(
// //     cart,
// //     userId,
// //     totalOrderPrice,
// //     totalOrderPriceAfterDiscount,
// //     discount,
// //     tax,
// //     shipping,
// //   );

// //   // لازم نرجع رابط PayPal approval للـ frontend
// //   const approveLink = paypalOrder.links.find((l) => l.rel === 'approve')?.href;
// //   return { redirectUrl: approveLink };
// // }


// // if (createOrderDto.paymentMethodType === 'paypal') {
// //   const paypalOrder = await this.paypalService.createOrderCheckoutSession(
// //     cart,
// //     userId,
// //     totalOrderPrice,
// //     totalOrderPriceAfterDiscount,
// //     discount,
// //     tax,
// //     shipping,
// //   );

// //   const approveLink = paypalOrder.links.find((l) => l.rel === 'approve')?.href;
// //   return { redirectUrl: approveLink };

// // }

// if (createOrderDto.paymentMethodType === 'paypal') {
//   const paypalOrder = await this.paypalService.createOrderCheckoutSession(
//     totalOrderPriceAfterDiscount ?? totalOrderPrice, // المبلغ اللي يتدفع
//     userId,
//   );

//   return { redirectUrl: paypalOrder.redirectUrl };
// }
//   // // 🟣 Paymob → send iframe URL
//   // if (createOrderDto.paymentMethodType === 'paymob') {
//   //   return this.paymobService.createOrder(
//   //     cart,
//   //     userId,
//   //     totalOrderPrice,
//   //     totalOrderPriceAfterDiscount,
//   //     discount,
//   //     tax,
//   //     shipping,
//   //   );
//   // }

//   throw new BadRequestException('Invalid payment method type');
// }


// async createOrder(createOrderDto: CreateOrderDto, userId: string) {
//   const cart = await this.cartService.getOrderCart(userId);

//   if (cart.cartItems.length === 0) {
//     throw new BadRequestException('Cart is empty');
//   }

//   const user = await this.usersService.findOne(userId);
//   if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//     throw new BadRequestException(
//       'please complete your address data to reach you successfully',
//     );
//   }

//   let totalOrderPrice = 0;

//   for (const item of cart.cartItems) {
//     const product = await this.productsService.checkProductsForOrder(
//       item.productId._id.toString(),
//       item.quantity,
//     );

//     if (!product) {
//       throw new BadRequestException(
//         `Product ${item.productId._id} no longer exists`,
//       );
//     }

//     if (product.price !== item.price) {
//       throw new BadRequestException(`Price changed for ${product.title}`);
//     }

//     if (product.stock < item.quantity) {
//       throw new BadRequestException(
//         `Not enough stock for ${product.title}`,
//       );
//     }

//     totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
//   }

//   // 🟢 الخصومات + الضريبة + الشحن
//   let discount = 0;
//   if (cart.coupons?.length > 0) {
//     for (const c of cart.coupons) {
//       const coupon = await this.couponService.findOneById(c._id.toString());
//       if (coupon?.discount) {
//         discount += coupon.discount;
//       }
//     }
//   }

//   const taxAndShipping = await this.taxAndShippingService.findAll();
//   const tax = taxAndShipping?.taxRate ?? 0;
//   const shipping = taxAndShipping?.shippingPrice ?? 0;

//   const totalOrderPriceAfterDiscount =
//     totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

//   // 🟢 Cash → إنشاء الأوردر مباشرة
//   if (createOrderDto.paymentMethodType === 'cash') {
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//       paymentMethodType: 'cash',
//       isPaid: false,
//     });

//     // خصم من المخزون
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // امسح الكارت
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }

//   // 🟠 Stripe → checkout session
//   if (createOrderDto.paymentMethodType === 'stripe') {
//     return this.stripeService.createOrderCheckoutSession(
//       cart,
//       userId,
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//     );
//   }

//   // 🔵 PayPal → إنشاء أوردر على PayPal وارجاع رابط الموافقة
//   if (createOrderDto.paymentMethodType === 'paypal') {
//     const paypalOrder = await this.paypalService.createOrderCheckoutSession(
//       totalOrderPriceAfterDiscount > 0
//         ? totalOrderPriceAfterDiscount
//         : totalOrderPrice,
//       userId,
//     );

//     return { redirectUrl: paypalOrder.redirectUrl };
//   }

//   // 🟣 Paymob → iframe URL
//   if (createOrderDto.paymentMethodType === 'paymob') {
//     return this.paymobService.createOrder(
//       cart,
//       userId,
//       totalOrderPrice,
//       totalOrderPriceAfterDiscount,
//       discount,
//       tax,
//       shipping,
//     );
//   }

//   throw new BadRequestException('Invalid payment method type');
// }




//   async createOrder(createOrderDto: CreateOrderDto, userId: string) {
//     const cart = await this.cartService.getOrderCart(userId);

//     if (cart.cartItems.length === 0) {
//       throw new BadRequestException('Cart is empty');
//     }

//     const user = await this.usersService.findOne(userId);
//     if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//       throw new BadRequestException(
//         'please complete your address data to reach you successfully',
//       );
//     }

//     let totalOrderPrice = 0;
//     for (const item of cart.cartItems) {
//       const product = await this.productsService.checkProductsForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );

//       if (!product) {
//         throw new BadRequestException(
//           `Product ${item.productId._id} no longer exists`,
//         );
//       }

//       if (product.price !== item.price) {
//         throw new BadRequestException(`Price changed for ${product.title}`);
//       }

//       if (product.stock < item.quantity) {
//         throw new BadRequestException(
//           `Not enough stock for ${product.title}`,
//         );
//       }

//       totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
//     }

//     // 🟢 الخصومات + الضريبة + الشحن
//     let discount = 0;
//     if (cart.coupons?.length > 0) {
//       for (const c of cart.coupons) {
//         const coupon = await this.couponService.findOneById(c._id.toString());
//         if (coupon?.discount) {
//           discount += coupon.discount;
//         }
//       }
//     }

//     const taxAndShipping = await this.taxAndShippingService.findAll();
//     const tax = taxAndShipping?.taxRate ?? 0;
//     const shipping = taxAndShipping?.shippingPrice ?? 0;

//     const totalOrderPriceAfterDiscount =
//       totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

//     // 🟢 Cash → إنشاء الأوردر مباشرة
//     if (createOrderDto.paymentMethodType === 'cash') {
//       const order = await this.orderModel.create({
//         user: new Types.ObjectId(userId),
//         orderItems: cart.cartItems.map((item) => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           price: item.price,
//           finalPrice: item.finalPrice,
//         })),
//         totalOrderPrice,
//         totalOrderPriceAfterDiscount,
//         discount,
//         tax,
//         shipping,
//         paymentMethodType: 'cash',
//         isPaid: false,
//       });

//       // خصم من المخزون
//       for (const item of cart.cartItems) {
//         await this.productsService.updateProductForOrder(
//           item.productId._id.toString(),
//           item.quantity,
//         );
//       }

//       // امسح الكارت
//       cart.cartItems = [];
//       cart.totalPrice = 0;
//       cart.totalPriceAfterDiscount = 0;
//       cart.coupons = [];
//       await cart.save();

//       return order;
//     }

//     // 🟠 Stripe
//     if (createOrderDto.paymentMethodType === 'stripe') {
//       return this.stripeService.createOrderCheckoutSession(
//         cart,
//         userId,
//         totalOrderPrice,
//         totalOrderPriceAfterDiscount,
//         discount,
//         tax,
//         shipping,
//       );
//     }
    

// // // 🔵 PayPal
// // if (createOrderDto.paymentMethodType === 'paypal') {
// //   const paypalOrder = await this.paypalService.createOrderCheckoutSession({
// //     cart,
// //     userId,
// //     totalOrderPrice,
// //     totalOrderPriceAfterDiscount,
// //     discount,
// //     tax,
// //     shipping,
// //   });

// //   return { redirectUrl: paypalOrder.redirectUrl };
// // }


// // 🔵 PayPal
// if (createOrderDto.paymentMethodType === 'paypal') {
//   const paypalOrder = await this.paypalService.createOrderCheckoutSession({
//     cart,
//     userId,
//     totalOrderPrice,
//     totalOrderPriceAfterDiscount,
//     discount,
//     tax,
//     shipping,
//   });

//   return {
//     redirectUrl: paypalOrder.redirectUrl,
//     orderId: paypalOrder.orderId, // ✅ هنا orderId مش id
//   };
// }

//     // 🟣 Paymob
//     // if (createOrderDto.paymentMethodType === 'paymob') {
//     //   return this.paymobService.createOrder(
//     //     cart,
//     //     userId,
//     //     totalOrderPrice,
//     //     totalOrderPriceAfterDiscount,
//     //     discount,
//     //     tax,
//     //     shipping,
//     //   );
//     // }

// if (createOrderDto.paymentMethodType === 'paymob') {
//   const paymobOrder = await this.paymobService.createOrderCheckoutSession(totalOrderPrice);

//   return {
//     _id: paymobOrder.orderId,
//     url: paymobOrder.iframeUrl,
//     paymentMethodType: 'paymob',
//   };
// }
//     throw new BadRequestException('Invalid payment method type');
//   }


  // async createOrder(data: {
  //   user: Types.ObjectId;
  //   orderItems: { productId: Types.ObjectId; quantity: number; price: number; finalPrice: number }[];
  //   totalOrderPrice: number;
  //   totalOrderPriceAfterDiscount: number;
  //   discount: number;
  //   tax: number;
  //   shipping: number;
  //   paymentMethodType: string;
  //   isPaid: boolean;
  //   paidAt?: Date | null;
  //   isDelivered: boolean;
  //   deliveredAt?: Date | null;
  // }) {
  //   const order = new this.orderModel({
  //     ...data,
  //     createdAt: new Date(),
  //   });
  //   return order.save();
  // }

  //  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
  //   const cart = await this.cartService.getOrderCart(userId);

  //   if (cart.cartItems.length === 0) {
  //     throw new BadRequestException('Cart is empty');
  //   }

  //   const user = await this.usersService.findOne(userId);
  //   if (!user.country || !user.city || !user.address || !user.phoneNumber) {
  //     throw new BadRequestException(
  //       'please complete your address data to reach you successfully',
  //     );
  //   }

  //   let totalOrderPrice = 0;
  //   for (const item of cart.cartItems) {
  //     const product = await this.productsService.checkProductsForOrder(
  //       item.productId._id.toString(),
  //       item.quantity,
  //     );

  //     if (!product) {
  //       throw new BadRequestException(
  //         `Product ${item.productId._id} no longer exists`,
  //       );
  //     }

  //     if (product.price !== item.price) {
  //       throw new BadRequestException(`Price changed for ${product.title}`);
  //     }

  //     if (product.stock < item.quantity) {
  //       throw new BadRequestException(
  //         `Not enough stock for ${product.title}`,
  //       );
  //     }

  //     totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
  //   }

  //   // 🟢 الخصومات + الضريبة + الشحن
  //   let discount = 0;
  //   if (cart.coupons?.length > 0) {
  //     for (const c of cart.coupons) {
  //       const coupon = await this.couponService.findOneById(c._id.toString());
  //       if (coupon?.discount) {
  //         discount += coupon.discount;
  //       }
  //     }
  //   }

  //   const taxAndShipping = await this.taxAndShippingService.findAll();
  //   const tax = taxAndShipping?.taxRate ?? 0;
  //   const shipping = taxAndShipping?.shippingPrice ?? 0;

  //   const totalOrderPriceAfterDiscount =
  //     totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

  //   // 🟢 Cash → إنشاء الأوردر مباشرة
  //   if (createOrderDto.paymentMethodType === 'cash') {
  //     const order = await this.orderModel.create({
  //       user: new Types.ObjectId(userId),
  //       orderItems: cart.cartItems.map((item) => ({
  //         productId: item.productId,
  //         quantity: item.quantity,
  //         price: item.price,
  //         finalPrice: item.finalPrice,
  //       })),
  //       totalOrderPrice,
  //       totalOrderPriceAfterDiscount,
  //       discount,
  //       tax,
  //       shipping,
  //       paymentMethodType: 'cash',
  //       isPaid: false,
  //       paidAt: null,
  //       isDelivered: false,
  //       deliveredAt: null,
  //     });

  //     // خصم من المخزون
  //     for (const item of cart.cartItems) {
  //       await this.productsService.updateProductForOrder(
  //         item.productId._id.toString(),
  //         item.quantity,
  //       );
  //     }

  //     // امسح الكارت
  //     cart.cartItems = [];
  //     cart.totalPrice = 0;
  //     cart.totalPriceAfterDiscount = 0;
  //     cart.coupons = [];
  //     await cart.save();

  //     return order;
  //   }

  //   // 🟠 Stripe
  //   if (createOrderDto.paymentMethodType === 'stripe') {
  //     return this.stripeService.createOrderCheckoutSession(
  //       cart,
  //       userId,
  //       totalOrderPrice,
  //       totalOrderPriceAfterDiscount,
  //       discount,
  //       tax,
  //       shipping,
  //     );
  //   }

  //   // 🔵 PayPal
  //   if (createOrderDto.paymentMethodType === 'paypal') {
  //     const paypalOrder = await this.paypalService.createOrderCheckoutSession({
  //       cart,
  //       userId,
  //       totalOrderPrice,
  //       totalOrderPriceAfterDiscount,
  //       discount,
  //       tax,
  //       shipping,
  //     });

  //     return {
  //       redirectUrl: paypalOrder.redirectUrl,
  //       orderId: paypalOrder.orderId,
  //     };
  //   }

  //   // 🟣 Paymob
  //   if (createOrderDto.paymentMethodType === 'paymob') {
  //     return this.paymobService.createOrderCheckoutSession(
  //       cart,
  //       userId,
  //       totalOrderPrice,
  //       totalOrderPriceAfterDiscount,
  //       discount,
  //       tax,
  //       shipping,
  //     );
  //   }

  //   throw new BadRequestException('Invalid payment method type');
  // }


  
  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
  const cart = await this.cartService.getOrderCart(userId);

  if (cart.cartItems.length === 0) {
    throw new BadRequestException('Cart is empty');
  }

  let totalOrderPrice = 0;

  for (const item of cart.cartItems) {
    const product = await this.productsService.checkProductsForOrder(
      item.productId._id.toString(),
      item.quantity,
    );

    if (!product) {
      throw new BadRequestException(
        `Product with id ${item.productId._id} no longer exists`,
      );
    }

    if (product.price !== item.price) {
      throw new BadRequestException(
        `Price changed for product ${product.title}`,
      );
    }

    if (product.stock < item.quantity) {
      throw new BadRequestException(
        `Not enough stock for product ${product.title}`,
      );
    }

    totalOrderPrice += Number(item.finalPrice) * Number(item.quantity);
  }

  // حساب الخصومات + الضريبة + الشحن
  let discount = 0;
  if (cart.coupons?.length > 0) {
    for (const c of cart.coupons) {
      const coupon = await this.couponService.findOneById(c._id.toString());
      if (coupon?.discount) {
        discount += coupon.discount;
      }
    }
  }

  const taxAndShipping = await this.taxAndShippingService.findAll();
  const tax = taxAndShipping?.taxRate ?? 0;
  const shipping = taxAndShipping?.shippingPrice ?? 0;

  const totalOrderPriceAfterDiscount =
    totalOrderPrice - discount - (tax * totalOrderPrice) / 100 - shipping;

  // ⬇️ لو كاش → أنشئ الأوردر فوراً
  if (createOrderDto.paymentMethodType === 'cash') {
    const order = await this.orderModel.create({
      user: new Types.ObjectId(userId),
      orderItems: cart.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.finalPrice,
      })),
      totalOrderPrice,
      totalOrderPriceAfterDiscount,
      discount,
      tax,
      shipping,
      paymentMethodType: 'cash',
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

  // ⬇️ لو كارد → روح اعمل checkout session في Stripe
  if (createOrderDto.paymentMethodType === 'stripe') {
    return this.stripeService.createOrderCheckoutSession(
      cart,
      userId,
      totalOrderPrice,
      totalOrderPriceAfterDiscount,
      discount,
      tax,
      shipping,
    );
  }

    // 🔵 PayPal
if (createOrderDto.paymentMethodType === 'paypal') {
  const paypalOrder = await this.paypalService.createOrderCheckoutSession({
    cart,
    userId,
    totalOrderPrice,
    totalOrderPriceAfterDiscount,
    discount,
    tax,
    shipping,
  });

  return {
    redirectUrl: paypalOrder.redirectUrl,
    orderId: paypalOrder.orderId, // ✅ هنا orderId مش id
  };
}

    // 🟣 Paymob
    // if (createOrderDto.paymentMethodType === 'paymob') {
    //   return this.paymobService.createOrder(
    //     cart,
    //     userId,
    //     totalOrderPrice,
    //     totalOrderPriceAfterDiscount,
    //     discount,
    //     tax,
    //     shipping,
    //   );
    // }

if (createOrderDto.paymentMethodType === 'paymob') {
  const paymobOrder = await this.paymobService.createOrderCheckoutSession(totalOrderPrice);

  return {
    _id: paymobOrder.orderId,
    url: paymobOrder.iframeUrl,
    paymentMethodType: 'paymob',
  };
}
    throw new BadRequestException('Invalid payment method type');
}


  async updateOrder(id: string, data: {
    isPaid?: boolean;
    paidAt?: Date;
    status?: string;
    transactionId?: string;
    paymobOrderId?: number;
    paymentKey?: string;
  }) {
    return this.orderModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async findOrderByPaymobId(paymobOrderId: number) {
    return this.orderModel.findOne({ paymobOrderId }).exec();
  }

  // async updateOrder(id: string, data: {
  //   isPaid?: boolean;
  //   paidAt?: Date;
  //   status?: string;
  //   transactionId?: string;
  //   paymobOrderId?: number;
  //   paymentKey?: string;
  // }) {
  //   return this.orderModel.findByIdAndUpdate(id, data, { new: true }).exec();
  // }

  // async findOrderByPaymobId(paymobOrderId: number) {
  //   return this.orderModel.findOne({ paymobOrderId }).exec();
  // }


async  getAdminAllOrders (page: number, limit: number){
        const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    // Calculate skip (offset) for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated users and total count
    // const [categories, total] = await this.categoryRepository.findAndCount({
    //   skip,
    //   take: limitNumber,
    //   relations: { posts: true },
    // });

    const orders = await this.orderModel
      .find()
      .sort({ role: 1, createdAt: 1 }) // ASC sorting
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const total = await this.orderModel.countDocuments().exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return response in desired format
    return {
      orders,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  async  getCurrentUserAllOrders(page: number, limit: number,userId:string) {
        const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    // Calculate skip (offset) for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated users and total count
    // const [categories, total] = await this.categoryRepository.findAndCount({
    //   skip,
    //   take: limitNumber,
    //   relations: { posts: true },
    // });

    const orders = await this.orderModel
      .find({user:userId})
      .sort({ role: 1, createdAt: 1 }) // ASC sorting
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const total = await this.orderModel.countDocuments({user:userId}).exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return response in desired format
    return {
      orders,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  findAll() {
    return `This action returns all order`;
  }

  //   async getCurrentUserCart(userId: string) {
  //   const cart = await this.cartModel.findOne({ user: userId });

  //   if (!cart) {
  //     throw new NotFoundException('cart not found');
  //   }

  //   for (let i = 0; i < cart.cartItems.length; i++) {
  //     await this.productsService.findOne(cart.cartItems[i].productId._id.toString())

  //   }

  //   const { totalPrice, totalPriceAfterDiscount, coupons } =
  //     await this.calculateCartTotals(userId);

  //   cart.totalPrice = totalPrice;
  //   cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  //   const cartCoupons = coupons.map((c) => c._id);
  //   cart.coupons = cartCoupons;
  //   await cart.save();

  //   await cart.save();

  //   return cart;
  // }

  //   private async calculateCartTotals(userId: string) {
  //   const cart = await this.o
  //     .findOne({ user: userId })
  //     .populate('cartItems.productId');
  //   console.log('cart', cart);

  //   if (!cart) {
  //     throw new NotFoundException('cart not found');
  //   }

  //   let cartClone = cart.cartItems;
  //   cart.totalPrice = cartClone.reduce(
  //     (sum, item) => sum + (item.finalPrice ?? 0) * item.quantity,
  //     0,
  //   );

  //   const couponsIds = cart.coupons.map((coupon) => coupon.toString());

  //   const coupons = await this.couponService.findSomeCouponsIds(couponsIds);

  //   const couponsDisccount = coupons.reduce(
  //     (sum, item) => sum + item.discount,
  //     0,
  //   );
  //   if (couponsDisccount >= cart.totalPrice) {
  //     cart.totalPriceAfterDiscount = cart.totalPrice;
  //   } else {
  //     cart.totalPriceAfterDiscount = cart.totalPrice - couponsDisccount;
  //   }

  //   return {
  //     totalPrice: cart.totalPrice,
  //     totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
  //     coupons,
  //   };
  // }

  async findOne(id: string,userId:string) {
    const order = await this.orderModel.findById(id).populate('orderItems.productId');
    if (!order){
      throw new NotFoundException(`order with id : ${id} not found`)
    }
    if(order?.user.toString() !== userId.toString()) {
throw new UnauthorizedException("you are no allowed to access this route");
    }

return order;
  }


   async updateOrderToPaid (id : string) { 
  const order = await this.orderModel.findById(id);
  
  if (!order) 
  {
  throw new NotFoundException(`order with id : ${id} not found`)
  }
  if (order.isPaid) {
    order.isPaid = false;
    order.paidAt =  "";
  } else {
    order.isPaid = true;
    order.paidAt = new Date();
  }
await order.save();
return order;
  
   }
  
  

   async updateOrderToDeliverd  (id : string) { 
    const order = await this.orderModel.findById(id);
  
  if (!order) 
  {
  throw new NotFoundException(`order with id : ${id} not found`)
  }
  if (order.isDelivered) {
    order.isDelivered = false;
    order.deliveredAt =  "";
  } else {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
await order.save();
return order;
  
   }




// async capturePaypalOrder(orderId: string) {
//   const captureResult = await this.paypalService.captureOrder(orderId); // استخدم paypal SDK
//   if (captureResult.status === "COMPLETED" || captureResult.status === "COMPLETED") {
//     // أنشئ order في DB هنا بنفس الـ logic اللي عندك عند cash
//     const created = await this.orderModel.create({ /* fill order fields from cart/session */ });
//     // خصم من المخزون، تفريغ الكارت...
//     return created;
//   }
//   throw new BadRequestException('PayPal capture failed');
// }

// async capturePaypalOrder(orderId: string, userId: string) {
//   const order = await this.paypalService.captureOrder(orderId, userId);
//   return order;
// }


  // 🟢 تأكيد الدفع من PayPal
async capturePaypalOrder(orderId: string, paypalOrderId: string, userId: string) {
  // ✅ استدعاء PayPal API
  const captureData = await this.paypalService.captureOrder(paypalOrderId,userId);

  if (captureData.status !== 'COMPLETED') {
    throw new BadRequestException('PayPal payment not completed');
  }

  // ✅ تحديث الأوردر في DB
  const order = await this.orderModel.findByIdAndUpdate(
    orderId,
    {
      isPaid: true,
      paidAt: new Date(),
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        payer: captureData.payer,
      },
    },
    { new: true },
  );

  if (!order) {
    throw new NotFoundException(`Order with id ${orderId} not found`);
  }

  // ✅ تحديث المخزون
  for (const item of order.orderItems) {
    await this.productsService.updateProductForOrder(
      item.productId.toString(),
      item.quantity,
    );
  }

  // ✅ تفريغ الكارت
  const cart = await this.cartService.getOrderCart(order.user.toString());
  cart.cartItems = [];
  cart.totalPrice = 0;
  cart.totalPriceAfterDiscount = 0;
  cart.coupons = [];
  await cart.save();

  return order;
}



  async capturePaypalPayment(paypalOrderId: string, payerId: string) {
    // مثال: طلب لـ PayPal API
    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
        },
      },
    );

    return response.data; // البيانات اللي رجعتها PayPal
  }

  async createOrderAfterPaypal(paymentResult: any) {
    // جلب كارت المستخدم
    const cart = await this.cartService.getCurrentUserCart(paymentResult.payer.payer_id);

    // إنشاء order في DB
    const newOrder = await this.orderModel.create({
      user: paymentResult.payer.payer_id,
      orderItems: cart.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.finalPrice,
      })),
      totalPrice: cart.totalPrice,
      paymentStatus: 'Paid',
      paymentResult,
    });

    // فضي الكارت
    // await this.cartService.clearCart(paymentResult.payer.payer_id);

    return newOrder;
  }


}
