// import { Injectable } from '@nestjs/common';
// import * as paypal from '@paypal/checkout-server-sdk';

// @Injectable()
// export class PaypalService {
//   private client: paypal.core.PayPalHttpClient;

//   constructor() {
//     const environment = new paypal.core.SandboxEnvironment(
//       process.env.PAYPAL_CLIENT_ID,
//       process.env.PAYPAL_CLIENT_SECRET,
//     );
//     this.client = new paypal.core.PayPalHttpClient(environment);
//   }

//   async createOrder(totalPrice: number, currency: string = 'USD') {
//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer('return=representation');
//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           amount: {
//             currency_code: currency,
//             value: totalPrice.toFixed(2),
//           },
//         },
//       ],
//       application_context: {
//         return_url: process.env.PAYPAL_SUCCESS_URL,
//         cancel_url: process.env.PAYPAL_CANCEL_URL,
//       },
//     });

//     const response = await this.client.execute(request);
//     return response.result;
//   }

//   async captureOrder(orderId: string) {
//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});
//     const response = await this.client.execute(request);
//     return response.result;
//   }
// }

// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import fetch from 'node-fetch';

// import { CartService } from 'src/cart/cart.service';
// import { ProductsService } from 'src/products/products.service';
// import { Order } from 'src/order/entities/order.schema';

// @Injectable()
// export class PaypalService {
//   private clientId: string;
//   private clientSecret: string;
//   private baseUrl: string;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly cartService: CartService,
//     private readonly productsService: ProductsService,
//     @InjectModel(Order.name) private readonly orderModel: Model<Order>,
//   ) {
//     this.clientId = this.configService.getOrThrow<string>('PAYPAL_CLIENT_ID');
//     this.clientSecret = this.configService.getOrThrow<string>('PAYPAL_CLIENT_SECRET');
//     this.baseUrl = this.configService.getOrThrow<string>('PAYPAL_API'); // sandbox or live
//   }

//   private async getAccessToken(): Promise<string> {
//     const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
//     const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Basic ${auth}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: 'grant_type=client_credentials',
//     });

//     const data = await response.json();
//     if (!data.access_token) {
//       throw new BadRequestException('Unable to get PayPal access token');
//     }
//     return data.access_token;
//   }

//   async createOrderCheckoutSession(
//     cart: any,
//     userId: string,
//     totalOrderPrice: number,
//     totalOrderPriceAfterDiscount: number,
//     discount: number,
//     tax: number,
//     shipping: number,
//   ) {
//     const accessToken = await this.getAccessToken();

//     const body = {
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           amount: {
//             currency_code: 'USD',
//             value: totalOrderPriceAfterDiscount.toFixed(2),
//             breakdown: {
//               item_total: { currency_code: 'USD', value: totalOrderPrice.toFixed(2) },
//               discount: { currency_code: 'USD', value: discount.toFixed(2) },
//               shipping: { currency_code: 'USD', value: shipping.toFixed(2) },
//               tax_total: { currency_code: 'USD', value: tax.toFixed(2) },
//             },
//           },
//           items: cart.cartItems.map((item) => ({
//             name: item.productId.title,
//             description: item.productId.description,
//             unit_amount: {
//               currency_code: 'USD',
//               value: Number(item.finalPrice).toFixed(2),
//             },
//             quantity: item.quantity.toString(),
//           })),
//           custom_id: JSON.stringify({
//             userId,
//             cartId: cart._id.toString(),
//             totalOrderPrice,
//             totalOrderPriceAfterDiscount,
//             discount,
//             tax,
//             shipping,
//           }),
//         },
//       ],
//       application_context: {
//         return_url: this.configService.getOrThrow<string>('PAYPAL_SUCCESS_URL'),
//         cancel_url: this.configService.getOrThrow<string>('PAYPAL_CANCEL_URL'),
//       },
//     };

//     const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();
//     if (!data.id) throw new BadRequestException('Unable to create PayPal order');
//     return data; // فيه approve link
//   }

//   async captureOrder(token: string) {
//     const accessToken = await this.getAccessToken();

//     const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${token}/capture`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await response.json();

//     if (data.status !== 'COMPLETED') {
//       throw new BadRequestException('Payment not completed');
//     }

//     const metadata = data.purchase_units[0].custom_id
//       ? JSON.parse(data.purchase_units[0].custom_id)
//       : null;

//     if (!metadata?.userId || !metadata?.cartId) {
//       throw new NotFoundException('Missing metadata');
//     }

//     // 1. Get cart
//     const cart = await this.cartService.getOrderCart(metadata.userId);

//     // 2. Create Order
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(metadata.userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice: Number(metadata.totalOrderPrice),
//       totalOrderPriceAfterDiscount: Number(metadata.totalOrderPriceAfterDiscount),
//       discount: Number(metadata.discount),
//       tax: Number(metadata.tax),
//       shipping: Number(metadata.shipping),
//       paymentMethodType: 'paypal',
//       isPaid: true,
//       paidAt: new Date(),
//     });

//     // 3. Update stock
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // 4. Empty cart
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }
// }

// import { Injectable, BadRequestException } from '@nestjs/common';
// import * as paypal from '@paypal/checkout-server-sdk';

// @Injectable()
// export class PaypalService {
//   private client: paypal.core.PayPalHttpClient;

//   constructor() {
//     const environment =
//       process.env.PAYPAL_MODE === 'live'
//         ? new paypal.core.LiveEnvironment(
//             process.env.PAYPAL_CLIENT_ID!,
//             process.env.PAYPAL_CLIENT_SECRET!,
//           )
//         : new paypal.core.SandboxEnvironment(
//             process.env.PAYPAL_CLIENT_ID!,
//             process.env.PAYPAL_CLIENT_SECRET!,
//           );

//     this.client = new paypal.core.PayPalHttpClient(environment);
//   }

//   /**
//    * إنشاء order على PayPal
//    */
//   // async createOrderCheckoutSession(
//   //   cart: any,
//   //   userId: string,
//   //   total: number,
//   //   totalAfterDiscount: number,
//   //   discount: number,
//   //   tax: number,
//   //   shipping: number,
//   // ) {
//   //   const request = new paypal.orders.OrdersCreateRequest();
//   //   request.prefer('return=representation');
//   //   request.requestBody({
//   //     intent: 'CAPTURE',
//   //     purchase_units: [
//   //       {
//   //         amount: {
//   //           currency_code: 'USD',
//   //           value: totalAfterDiscount.toFixed(2),
//   //           breakdown: {
//   //             item_total: {
//   //               currency_code: 'USD',
//   //               value: total.toFixed(2),
//   //             },
//   //             discount: {
//   //               currency_code: 'USD',
//   //               value: discount.toFixed(2),
//   //             },
//   //             tax_total: {
//   //               currency_code: 'USD',
//   //               value: tax.toFixed(2),
//   //             },
//   //             shipping: {
//   //               currency_code: 'USD',
//   //               value: shipping.toFixed(2),
//   //             },
//   //           },
//   //         },
//   //       },
//   //     ],
//   //     application_context: {
//   //       return_url: `${process.env.CLIENT_URL}/paypal-success`,
//   //       cancel_url: `${process.env.CLIENT_URL}/paypal-cancel`,
//   //       brand_name: 'My Shop',
//   //       user_action: 'PAY_NOW',
//   //     },
//   //   });

//   //   try {
//   //     const order = await this.client.execute(request);

//   //     const approveLink = order.result.links.find(
//   //       (link: any) => link.rel === 'approve',
//   //     );

//   //     if (!approveLink) {
//   //       throw new BadRequestException('PayPal did not return approval link');
//   //     }

//   //     return {
//   //       orderId: order.result.id,
//   //       redirectUrl: approveLink.href, // 👈 ده اللي الـ frontend هيستخدمه
//   //     };
//   //   } catch (error) {
//   //     console.error('PayPal createOrder error', error);
//   //     throw new BadRequestException('Failed to create PayPal order');
//   //   }
//   // }

//   // في PayPalService
// async createOrderCheckoutSession(
//   cart: any,
//   userId: string,
//   totalOrderPrice: number,
//   totalOrderPriceAfterDiscount: number,
//   discount: number,
//   tax: number,
//   shipping: number,
// ) {
//   const request = new this.paypal.orders.OrdersCreateRequest();
//   request.prefer('return=representation');
//   request.requestBody({
//     intent: 'CAPTURE',
//     purchase_units: [
//       {
//         reference_id: cart._id.toString(),
//         amount: {
//           currency_code: 'USD',
//           value: totalOrderPrice.toFixed(2),
//         },
//       },
//     ],
//     application_context: {
//       return_url: this.configService.getOrThrow('PAYPAL_SUCCESS_URL'),
//       cancel_url: this.configService.getOrThrow('PAYPAL_CANCEL_URL'),
//     },
//   });

//   const order = await this.paypalClient.execute(request);
//   return order.result; // ده اللي فيه links[]
// }


//   /**
//    * تنفيذ الدفع بعد ما المستخدم يوافق
//    */
//   async captureOrder(orderId: string) {
//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});

//     try {
//       const capture = await this.client.execute(request);
//       return capture.result; // 👈 بيرجع تفاصيل الـ capture
//     } catch (error) {
//       console.error('PayPal capture error', error);
//       throw new BadRequestException('Failed to capture PayPal order');
//     }
//   }
// }





// import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as paypal from '@paypal/checkout-server-sdk';
// import { InjectModel } from '@nestjs/mongoose';
// import { Order } from 'src/order/entities/order.schema';
// import { Model, Types } from 'mongoose';
// import { CartService } from 'src/cart/cart.service';
// import { ProductsService } from 'src/products/products.service';

// @Injectable()
// export class PaypalService {
//   private paypalClient: paypal.core.PayPalHttpClient;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly cartService: CartService,
//     private readonly productsService: ProductsService,
//     @InjectModel(Order.name) private readonly orderModel: Model<Order>,
//   ) {
//     const environment = new paypal.core.SandboxEnvironment(
//       this.configService.getOrThrow('PAYPAL_CLIENT_ID'),
//       this.configService.getOrThrow('PAYPAL_CLIENT_SECRET'),
//     );

//     this.paypalClient = new paypal.core.PayPalHttpClient(environment);
//   }

//   // ⬇️ إنشاء جلسة دفع
//   async createOrderCheckoutSession(
//     cart: any,
//     userId: string,
//     totalOrderPrice: number,
//     totalOrderPriceAfterDiscount: number,
//     discount: number,
//     tax: number,
//     shipping: number,
//   ) {
//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer('return=representation');
//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           reference_id: cart._id.toString(),
//           amount: {
//             currency_code: 'USD',
//             value: totalOrderPrice.toFixed(2),
//           },
//         },
//       ],
//       application_context: {
//         return_url: this.configService.getOrThrow('PAYPAL_SUCCESS_URL'),
//         cancel_url: this.configService.getOrThrow('PAYPAL_CANCEL_URL'),
//       },
//     });

//     const order = await this.paypalClient.execute(request);
//     const approveLink = order.result.links.find((l) => l.rel === 'approve')?.href;

//     return {
//       orderId: order.result.id,
//       redirectUrl: approveLink,
//     };
//   }

//   // ⬇️ تأكيد الدفع بعد رجوع المستخدم
//   async captureOrder(orderId: string, userId: string) {
//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});

//     const capture = await this.paypalClient.execute(request);

//     if (capture.result.status !== 'COMPLETED') {
//       throw new BadRequestException('PayPal capture failed');
//     }

//     // ✅ إنشاء الأوردر في DB
//     const cart = await this.cartService.getOrderCart(userId);
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice: cart.totalPrice,
//       totalOrderPriceAfterDiscount: cart.totalPriceAfterDiscount,
//       discount: 0,
//       tax: 0,
//       shipping: 0,
//       paymentMethodType: 'paypal',
//       isPaid: true,
//       paidAt: new Date(),
//     });

//     // خصم من المخزون
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // تفريغ الكارت
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }
// }



// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Order } from 'src/order/entities/order.schema';
// import * as paypal from '@paypal/checkout-server-sdk';


// @Injectable()
// export class PaypalService {
//   private paypalClient: checkoutNodeJssdk.core.PayPalHttpClient;

//   constructor(
//     private readonly configService: ConfigService,
//     @InjectModel(Order.name) private orderModel: Model<Order>,
//   ) {
//     const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
//       this.configService.getOrThrow('PAYPAL_CLIENT_ID'),
//       this.configService.getOrThrow('PAYPAL_CLIENT_SECRET'),
//     );

//     this.paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
//   }

//   /**
//    * إنشاء أوردر في PayPal
//    */
//   async createOrderCheckoutSession(amount: number, userId: string) {
//     const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
//     request.prefer('return=representation');
//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           amount: {
//             currency_code: 'USD',
//             value: amount.toFixed(2),
//           },
//         },
//       ],
//       application_context: {
//         return_url: this.configService.getOrThrow('PAYPAL_SUCCESS_URL'),
//         cancel_url: this.configService.getOrThrow('PAYPAL_CANCEL_URL'),
//       },
//     });

//     try {
//       const order = await this.paypalClient.execute(request);

//       const approveLink = order.result.links.find(
//         (link) => link.rel === 'approve',
//       )?.href;

//       return {
//         orderId: order.result.id,
//         redirectUrl: approveLink,
//       };
//     } catch (err) {
//       throw new InternalServerErrorException('PayPal create order failed');
//     }
//   }

//   /**
//    * التقاط الدفع من PayPal + إنشاء Order في DB
//    */
//   async captureOrder(orderId: string, userId: string) {
//     const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});

//     try {
//       const capture = await this.paypalClient.execute(request);

//       if (capture.result.status !== 'COMPLETED') {
//         throw new InternalServerErrorException('PayPal payment not completed');
//       }

//       // إنشاء الأوردر في DB
//       const newOrder = new this.orderModel({
//         user: userId,
//         paymentMethod: 'paypal',
//         isPaid: true,
//         paidAt: new Date(),
//         paymentResult: {
//           id: capture.result.id,
//           status: capture.result.status,
//           email_address: capture.result.payer.email_address,
//         },
//         // TODO: ممكن تحط هنا cart items, totalPrice, إلخ
//       });

//       return await newOrder.save();
//     } catch (err) {
//       throw new InternalServerErrorException('PayPal capture order failed');
//     }
//   }
// }




// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as paypal from '@paypal/checkout-server-sdk';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { CartService } from 'src/cart/cart.service';
// import { ProductsService } from 'src/products/products.service';
// import { Order } from 'src/order/entities/order.schema';

// @Injectable()
// export class PaypalService {
//   private client: paypal.core.PayPalHttpClient;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly cartService: CartService,
//     private readonly productsService: ProductsService,
//     @InjectModel(Order.name) private readonly orderModel: Model<Order>,
//   ) {
//     const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
//     const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

//     const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
//     this.client = new paypal.core.PayPalHttpClient(environment);
//   }

//   /**
//    * ✅ إنشاء الأوردر في PayPal
//    */
//   async createOrderCheckoutSession(
//     cart: any,
//     userId: string,
//     totalOrderPrice: number,
//     totalOrderPriceAfterDiscount: number,
//     discount: number,
//     tax: number,
//     shipping: number,
//   ) {
//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer('return=representation');

//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           amount: {
//             currency_code: 'USD',
//             value: totalOrderPriceAfterDiscount.toFixed(2),
//             breakdown: {
//               item_total: { currency_code: 'USD', value: totalOrderPrice.toFixed(2) },
//               discount: { currency_code: 'USD', value: discount.toFixed(2) },
//               tax_total: { currency_code: 'USD', value: tax.toFixed(2) },
//               shipping: { currency_code: 'USD', value: shipping.toFixed(2) },
//             },
//           },
//           items: cart.cartItems.map((item) => ({
//             name: item.productId.title,
//             unit_amount: {
//               currency_code: 'USD',
//               value: item.finalPrice.toFixed(2),
//             },
//             quantity: item.quantity.toString(),
//           })),
//         },
//       ],
//       application_context: {
//         return_url: this.configService.get<string>('PAYPAL_SUCCESS_URL'),
//         cancel_url: this.configService.get<string>('PAYPAL_CANCEL_URL'),
//       },
//     });

//     const order = await this.client.execute(request);

//     // رجع الـ approve link للـ frontend
//     const approveLink = order.result.links.find((l) => l.rel === 'approve')?.href;

//     return {
//       orderId: order.result.id,
//       redirectUrl: approveLink,
//     };
//   }

//   /**
//    * ✅ Capture الأوردر + إنشاء الأوردر في DB
//    */
//   async captureOrder(orderId: string, userId: string) {
//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});

//     const capture = await this.client.execute(request);

//     if (capture.result.status !== 'COMPLETED') {
//       throw new BadRequestException('PayPal capture failed');
//     }

//     // هات الكارت من DB
//     const cart = await this.cartService.getOrderCart(userId);
//     if (!cart) throw new NotFoundException('Cart not found');

//     // أنشئ order في DB
//     const order = await this.orderModel.create({
//       user: new Types.ObjectId(userId),
//       orderItems: cart.cartItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//         finalPrice: item.finalPrice,
//       })),
//       totalOrderPrice: cart.totalPrice,
//       totalOrderPriceAfterDiscount: cart.totalPriceAfterDiscount,
//       discount: 0, // ممكن تجيبها من metadata
//       tax: 0,
//       shipping: 0,
//       paymentMethodType: 'paypal',
//       isPaid: true,
//       paidAt: new Date(),
//     });

//     // خصم من المخزون
//     for (const item of cart.cartItems) {
//       await this.productsService.updateProductForOrder(
//         item.productId._id.toString(),
//         item.quantity,
//       );
//     }

//     // فضي الكارت
//     cart.cartItems = [];
//     cart.totalPrice = 0;
//     cart.totalPriceAfterDiscount = 0;
//     cart.coupons = [];
//     await cart.save();

//     return order;
//   }
// }



// import { Injectable, BadRequestException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

// @Injectable()
// export class PaypalService {
//   private client: checkoutNodeJssdk.core.PayPalHttpClient;

//   constructor(private readonly configService: ConfigService) {
//     const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
//     const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
//     const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
//       clientId,
//       clientSecret,
//     );
//     this.client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
//   }

//   // 🟢 إنشاء الأوردر على PayPal
//   async createOrderCheckoutSession(amount: number, userId: string) {
//     const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
//     request.prefer('return=representation');
//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           reference_id: userId,
//           amount: {
//             currency_code: 'USD',
//             value: amount.toFixed(2),
//           },
//         },
//       ],
//       application_context: {
//         brand_name: 'Zef Market',
//         landing_page: 'LOGIN',
//         user_action: 'PAY_NOW',
//         return_url: this.configService.get<string>('PAYPAL_SUCCESS_URL'),
//         cancel_url: this.configService.get<string>('PAYPAL_CANCEL_URL'),
//       },
//     });

//     const order = await this.client.execute(request);

//     if (!order.result.links) {
//       throw new BadRequestException('No approval link from PayPal');
//     }

//     const approveLink = order.result.links.find((l) => l.rel === 'approve')
//       ?.href;

//     return {
//       id: order.result.id,
//       redirectUrl: approveLink,
//     };
//   }

//   // 🟢 تأكيد الدفع بعد موافقة العميل
//   async captureOrder(orderId: string) {
//     const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});

//     const capture = await this.client.execute(request);
//     return capture.result;
//   }
// }



// import { BadRequestException, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// // import paypal from '@paypal/checkout-server-sdk';
// import * as paypal from '@paypal/checkout-server-sdk';
// import checkoutNodeJssdk from '@paypal/checkout-server-sdk';


// @Injectable()
// export class PaypalService {
//   private client: paypal.core.PayPalHttpClient;

//   constructor(private readonly configService: ConfigService) {
//     const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
//     const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

//     const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
//     this.client = new paypal.core.PayPalHttpClient(environment);
//   }

//   // async createOrderCheckoutSession(
//   //   cart: any,
//   //   userId: string,
//   //   totalOrderPrice: number,
//   //   totalOrderPriceAfterDiscount: number,
//   //   discount: number,
//   //   tax: number,
//   //   shipping: number,
//   // ) {
//   //   const request = new paypal.orders.OrdersCreateRequest();
//   //   request.prefer('return=representation');
//   //   request.requestBody({
//   //     intent: 'CAPTURE',
//   //     purchase_units: [
//   //       {
//   //         amount: {
//   //           currency_code: 'USD',
//   //           value: totalOrderPriceAfterDiscount || totalOrderPrice,
//   //           breakdown: {
//   //             item_total: { currency_code: 'USD', value: totalOrderPrice },
//   //             discount: { currency_code: 'USD', value: discount || 0 },
//   //             tax_total: { currency_code: 'USD', value: tax || 0 },
//   //             shipping: { currency_code: 'USD', value: shipping || 0 },
//   //           },
//   //         },
//   //       },
//   //     ],
//   //     application_context: {
//   //       return_url: this.configService.getOrThrow('PAYPAL_SUCCESS_URL'),
//   //       cancel_url: this.configService.getOrThrow('PAYPAL_CANCEL_URL'),
//   //     },
//   //   });

//   //   const response = await this.client.execute(request);
//   //   return response.result;
//   // }

// //   async createOrderCheckoutSession(params: {
// //   cart: any;
// //   userId: string;
// //   totalOrderPrice: number;
// //   totalOrderPriceAfterDiscount: number;
// //   discount: number;
// //   tax: number;
// //   shipping: number;
// // }) {
// //   const {
// //     cart,
// //     userId,
// //     totalOrderPrice,
// //     totalOrderPriceAfterDiscount,
// //     discount,
// //     tax,
// //     shipping,
// //   } = params;

// //   const request = new paypal.orders.OrdersCreateRequest();
// //   request.prefer('return=representation');
// //   request.requestBody({
// //     intent: 'CAPTURE',
// //     purchase_units: [
// //       {
// //         amount: {
// //           currency_code: 'USD',
// //           value: totalOrderPriceAfterDiscount || totalOrderPrice,
// //           breakdown: {
// //             item_total: { currency_code: 'USD', value: totalOrderPrice },
// //             discount: { currency_code: 'USD', value: discount || 0 },
// //             tax_total: { currency_code: 'USD', value: tax || 0 },
// //             shipping: { currency_code: 'USD', value: shipping || 0 },
// //           },
// //         },
// //       },
// //     ],
// //     application_context: {
// //       return_url: this.configService.getOrThrow('PAYPAL_SUCCESS_URL'),
// //       cancel_url: this.configService.getOrThrow('PAYPAL_CANCEL_URL'),
// //     },
// //   });

// //   const response = await this.client.execute(request);

// //   // نرجع الـ approve link
// //   const approveLink = response.result.links.find((l) => l.rel === 'approve')?.href;

// //   return { orderId: response.result.id, redirectUrl: approveLink };
// // }



//  async createOrderCheckoutSession(
//     cart: any,
//     userId: string,
//     totalOrderPrice: number,
//     totalOrderPriceAfterDiscount: number,
//     discount: number,
//     tax: number,
//     shipping: number,
//   ) {
//     // 1️⃣ حساب itemTotal من cart
//     const itemTotal = cart.cartItems.reduce(
//       (acc, item) => acc + Number(item.finalPrice) * Number(item.quantity),
//       0,
//     );

//     // 2️⃣ لو في خصم، نخصمه من الإجمالي
//     const discountedTotal = itemTotal - discount;

//     // 3️⃣ الإجمالي النهائي = items + tax + shipping
//     const expectedTotal = discountedTotal + tax + shipping;

//     // ✅ بناء request للـ PayPal
//     const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
//     request.prefer('return=representation');
//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [
//         {
//           amount: {
//             currency_code: 'USD',
//             value: expectedTotal.toFixed(2), // PayPal عايز string
//             breakdown: {
//               item_total: {
//                 currency_code: 'USD',
//                 value: discountedTotal.toFixed(2),
//               },
//               tax_total: {
//                 currency_code: 'USD',
//                 value: tax.toFixed(2),
//               },
//               shipping: {
//                 currency_code: 'USD',
//                 value: shipping.toFixed(2),
//               },
//             },
//           },
//           items: cart.cartItems.map((item) => ({
//             name: item.productId.title,
//             unit_amount: {
//               currency_code: 'USD',
//               value: Number(item.finalPrice).toFixed(2),
//             },
//             quantity: item.quantity.toString(),
//           })),
//         },
//       ],
//       application_context: {
//         return_url: this.configService.getOrThrow('PAYPAL_SUCCESS_URL'),
//         cancel_url: this.configService.getOrThrow('PAYPAL_CANCEL_URL'),
//       },
//     });

//     try {
//       const order = await this.client.execute(request);

//       // نرجع الـ redirect URL للـ frontend
//       const approveLink = order.result.links.find((l) => l.rel === 'approve')?.href;
//       // return { orderId: order.result.id, redirectUrl: approveLink };
//       return { 
//   redirectUrl: paypalOrder.redirectUrl,
//   orderId: paypalOrder.orderId, 
// };
//     } catch (err) {
//       console.error('PayPal create order error:', err);
//       throw new BadRequestException('Failed to create PayPal order');
//     }
//   }
//   // async captureOrder(orderId: string, userId: string) {
//   //   const request = new paypal.orders.OrdersCaptureRequest(orderId);
//   //   request.requestBody({});

//   //   const response = await this.client.execute(request);

//   //   // هنا ممكن تسجل الأوردر في DB
//   //   return response.result;
//   // }

//     async captureOrder(orderId: string) {
//     const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});
//     const capture = await this.client.execute(request);
//     return capture.result;
//   }
// }



import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrderCheckoutSession({
    cart,
    userId,
    totalOrderPrice,
    totalOrderPriceAfterDiscount,
    discount,
    tax,
    shipping,
  }: {
    cart: any;
    userId: string;
    totalOrderPrice: number;
    totalOrderPriceAfterDiscount: number;
    discount: number;
    tax: number;
    shipping: number;
  }): Promise<{ orderId: string; redirectUrl: string }> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value:
              totalOrderPriceAfterDiscount > 0
                ? totalOrderPriceAfterDiscount.toFixed(2)
                : totalOrderPrice.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Zef-Market',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: `${process.env.PAYPAL_RETURN_URL}`,
        cancel_url: `${process.env.PAYPAL_CANCEL_URL}`,
      },
    });

    const response = await this.client.execute(request);

    const approveLink = response.result.links.find(
      (l) => l.rel === 'approve',
    )?.href;

    return {
      orderId: response.result.id, // ✅ رجعنا orderId
      redirectUrl: approveLink,
    };
  }

  async captureOrder(orderId: string, userId : string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const response = await this.client.execute(request);
    return response.result;
  }
}
