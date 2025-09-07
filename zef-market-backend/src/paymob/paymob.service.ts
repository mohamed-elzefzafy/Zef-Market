import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class PaymobService {
  private readonly apiKey = process.env.PAYMOB_API_KEY; // خدها من .env
  private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID; // Integration ID من Dashboard
  private readonly iframeId = process.env.PAYMOB_IFRAME_ID; // Iframe ID من Dashboard

  private readonly baseUrl = "https://accept.paymob.com/api";

  // ✅ 1) Get Auth Token
  private async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.apiKey,
      });
      return response.data.token;
    } catch (err) {
      throw new HttpException(
        "Failed to get Paymob token",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ 2) Create Order
  private async createPaymobOrder(
    authToken: string,
    amountCents: number,
  ): Promise<number> {
    try {
      const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents.toString(), // لازم string
        currency: "EGP",
        items: [],
      });
      return response.data.id; // orderId من Paymob
    } catch (err) {
      throw new HttpException(
        "Failed to create Paymob order",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ 3) Get Payment Key
  private async getPaymentKey(
    authToken: string,
    amountCents: number,
    orderId: number,
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          amount_cents: amountCents.toString(),
          currency: "EGP",
          order_id: orderId,
          billing_data: {
            apartment: "NA",
            email: "test@example.com",
            floor: "NA",
            first_name: "Test",
            street: "NA",
            building: "NA",
            phone_number: "+201234567890",
            shipping_method: "PKG",
            postal_code: "NA",
            city: "Cairo",
            country: "EG",
            last_name: "User",
            state: "Cairo",
          },
          integration_id: this.integrationId,
        },
      );

      return response.data.token; // payment_key
    } catch (err) {
      throw new HttpException(
        "Failed to get Paymob payment key",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ 4) Create Order Checkout Session (main function)
  async createOrderCheckoutSession(
    amount: number, // السعر بالجنيه * 100 (amount_cents)
  ): Promise<{ iframeUrl: string; orderId: number }> {
    const authToken = await this.getAuthToken();
    const orderId = await this.createPaymobOrder(authToken, amount);
    const paymentKey = await this.getPaymentKey(authToken, amount, orderId);

    // الـ iframe URL النهائي
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;

    return { iframeUrl, orderId };
  }
}




// import { Injectable, BadRequestException } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { lastValueFrom } from 'rxjs';
// import { CartService } from '../cart/cart.service';
// import { OrderService } from '../order/order.service';
// import { UsersService } from '../users/users.service';
// import { ProductsService } from '../products/products.service';
// import { Types } from 'mongoose';

// @Injectable()
// export class PaymobService {
//   private readonly apiKey = 'YOUR_PAYMOB_API_KEY'; // ضع مفتاح API من Paymob Dashboard
//   private readonly baseUrl = 'https://accept.paymob.com/api'; // حسب الدولة
//   private readonly integrationId = 'YOUR_INTEGRATION_ID'; // من Paymob Dashboard
//   private readonly hmacSecret = 'YOUR_HMAC_SECRET'; // للتحقق من الـ callback
//   private readonly iframeId = 'YOUR_IFRAME_ID'; // من Paymob Dashboard (للـ iFrame)

//   constructor(
//     private readonly httpService: HttpService,
//     private readonly cartService: CartService,
//     private readonly orderService: OrderService,
//     private readonly usersService: UsersService,
//     private readonly productsService: ProductsService,
//   ) {}

//   async createOrderCheckoutSession(
//     cart: any,
//     userId: string,
//     totalOrderPrice: number,
//     totalOrderPriceAfterDiscount: number,
//     discount: number,
//     tax: number,
//     shipping: number,
//   ) {
//     // 1. التحقق من بيانات المستخدم
//     const user = await this.usersService.findOne(userId);
//     if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//       throw new BadRequestException(
//         'please complete your address data to reach you successfully',
//       );
//     }

//     // 2. التحقق من المنتجات والمخزون
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
//     }

    // 3. إنشاء الطلب في قاعدة البيانات
    // const order = await this.orderService.createOrder({
    //   user: new Types.ObjectId(userId),
    //   orderItems: cart.cartItems.map((item) => ({
    //     productId: item.productId,
    //     quantity: item.quantity,
    //     price: item.price,
    //     finalPrice: item.finalPrice,
    //   })),
    //   totalOrderPrice,
    //   totalOrderPriceAfterDiscount,
    //   discount,
    //   tax,
    //   shipping,
    //   paymentMethodType: 'paymob',
    //   isPaid: false,
    //   paidAt: null,
    //   isDelivered: false,
    //   deliveredAt: null,
    // });

    // 4. الحصول على Token من Paymob
//     const authResponse = await lastValueFrom(
//       this.httpService.post(`${this.baseUrl}/auth/tokens`, {
//         api_key: this.apiKey,
//       }),
//     );
//     const authToken = authResponse.data.token;

//     // 5. إنشاء Payment Intent في Paymob
//     const paymentResponse = await lastValueFrom(
//       this.httpService.post(`${this.baseUrl}/ecommerce/orders`, {
//         auth_token: authToken,
//         delivery_needed: false,
//         amount_cents: totalOrderPriceAfterDiscount * 100, // Paymob بياخد المبلغ بالقرش
//         currency: 'EGP',
//         items: cart.cartItems.map((item) => ({
//           name: item.productId.title,
//           amount_cents: item.finalPrice * 100,
//           quantity: item.quantity,
//         })),
//       }),
//     );
//     const paymobOrderId = paymentResponse.data.id;

//     // 6. إنشاء Payment Key
//     const paymentKeyResponse = await lastValueFrom(
//       this.httpService.post(`${this.baseUrl}/acceptance/payment_keys`, {
//         auth_token: authToken,
//         amount_cents: totalOrderPriceAfterDiscount * 100,
//         expiration: 3600, // 1 ساعة
//         order_id: paymobOrderId,
//         billing_data: {
//           email: user.email || 'user@example.com',
//           first_name: user.firstName || 'User',
//           last_name: user.lastName || 'Test',
//           phone_number: user.phoneNumber,
//           apartment: 'NA',
//           floor: 'NA',
//           street: user.address,
//           building: 'NA',
//           shipping_method: 'NA',
//           postal_code:  'NA',
//           city: user.city,
//           country: user.country,
//           state: 'NA',
//         },
//         currency: 'EGP',
//         integration_id: this.integrationId,
//       }),
//     );
//     const paymentKey = paymentKeyResponse.data.token;

//     // 7. تحديث الطلب بمعلومات Paymob
//     await this.orderService.updateOrder(order.id, {
//       paymobOrderId,
//       paymentKey,
//     });

//     // 8. إرجاع الـ iFrame URL ومعلومات الطلب
//     return {
//       orderId: order.id,
//       iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
//     };
//   }

//   async handlePaymentCallback(query: any) {
//     const { success, order_id, transaction_id, hmac } = query;

//     // 1. التحقق من HMAC
//     const isValidHmac = this.verifyHmac(query, hmac);
//     if (!isValidHmac) {
//       throw new BadRequestException('Invalid HMAC signature');
//     }

//     // 2. البحث عن الطلب باستخدام paymobOrderId
//     const order = await this.orderService.findOrderByPaymobId(order_id);
//     if (!order) {
//       throw new BadRequestException('Order not found');
//     }

//     // 3. تحديث حالة الطلب وخصم المخزون
//     if (success === 'true') {
//       await this.orderService.updateOrder(order.id, {
//         isPaid: true,
//         paidAt: new Date(),
//         transactionId: transaction_id,
//       });

//       // 4. خصم المخزون
//       for (const item of order.orderItems) {
//         await this.productsService.updateProductForOrder(
//           item.productId._id.toString(),
//           item.quantity,
//         );
//       }

//       // 5. إفراغ الـ Cart
//       const cart = await this.cartService.getOrderCart(order.user.toString());
//       cart.cartItems = [];
//       cart.totalPrice = 0;
//       cart.totalPriceAfterDiscount = 0;
//       cart.coupons = [];
//       await cart.save();
//     } else {
//       await this.orderService.updateOrder(order.id, {
//         status: 'failed',
//       });
//     }

//     // 6. إرجاع رابط التوجيه للفرونت إند
//     return {
//       redirectUrl: `https://yourwebsite.com/payment-success?orderId=${order.id}&success=${success}`,
//     };
//   }

//   private verifyHmac(query: any, receivedHmac: string): boolean {
//     const crypto = require('crypto');
//     const sortedKeys = Object.keys(query)
//       .filter((key) => key !== 'hmac')
//       .sort();
//     const concatenated = sortedKeys.map((key) => query[key]).join('');
//     const calculatedHmac = crypto
//       .createHmac('sha512', this.hmacSecret)
//       .update(concatenated)
//       .digest('hex');
//     return calculatedHmac === receivedHmac;
//   }
// }




// import { Injectable, BadRequestException } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { lastValueFrom } from 'rxjs';
// import { CartService } from '../cart/cart.service';
// import { OrderService } from '../order/order.service';
// import { UsersService } from '../users/users.service';
// import { ProductsService } from '../products/products.service';
// import { Types } from 'mongoose';

// @Injectable()
// export class PaymobService {
//   private readonly apiKey = 'YOUR_PAYMOB_API_KEY'; // ضع مفتاح API من Paymob Dashboard
//   private readonly baseUrl = 'https://accept.paymob.com/api'; // حسب الدولة
//   private readonly integrationId = 'YOUR_INTEGRATION_ID'; // من Paymob Dashboard
//   private readonly hmacSecret = 'YOUR_HMAC_SECRET'; // للتحقق من الـ callback
//   private readonly iframeId = 'YOUR_IFRAME_ID'; // من Paymob Dashboard (للـ iFrame)

//   constructor(
//     private readonly httpService: HttpService,
//     private readonly cartService: CartService,
//     private readonly orderService: OrderService,
//     private readonly usersService: UsersService,
//     private readonly productsService: ProductsService,
//   ) {}

//   async createOrderCheckoutSession(
//     cart: any,
//     userId: string,
//     totalOrderPrice: number,
//     totalOrderPriceAfterDiscount: number,
//     discount: number,
//     tax: number,
//     shipping: number,
//   ) {
//     // 1. التحقق من بيانات المستخدم
//     const user = await this.usersService.findOne(userId);
//     if (!user.country || !user.city || !user.address || !user.phoneNumber) {
//       throw new BadRequestException(
//         'please complete your address data to reach you successfully',
//       );
//     }

//     // 2. التحقق من المنتجات والمخزون
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
//     }

//     // 3. إنشاء الطلب في قاعدة البيانات
//     const createOrderDto = { paymentMethodType: 'paymob' };
//     const order = await this.orderService.createOrder(createOrderDto, userId);

//     // 4. الحصول على Token من Paymob
//     const authResponse = await lastValueFrom(
//       this.httpService.post(`${this.baseUrl}/auth/tokens`, {
//         api_key: this.apiKey,
//       }),
//     );
//     const authToken = authResponse.data.token;

//     // 5. إنشاء Payment Intent في Paymob
//     const paymentResponse = await lastValueFrom(
//       this.httpService.post(`${this.baseUrl}/ecommerce/orders`, {
//         auth_token: authToken,
//         delivery_needed: false,
//         amount_cents: totalOrderPriceAfterDiscount * 100, // Paymob بياخد المبلغ بالقرش
//         currency: 'EGP',
//         items: cart.cartItems.map((item) => ({
//           name: item.productId.title,
//           amount_cents: item.finalPrice * 100,
//           quantity: item.quantity,
//         })),
//       }),
//     );
//     const paymobOrderId = paymentResponse.data.id;

//     // 6. إنشاء Payment Key
//     const paymentKeyResponse = await lastValueFrom(
//       this.httpService.post(`${this.baseUrl}/acceptance/payment_keys`, {
//         auth_token: authToken,
//         amount_cents: totalOrderPriceAfterDiscount * 100,
//         expiration: 3600, // 1 ساعة
//         order_id: paymobOrderId,
//         billing_data: {
//           email: user.email || 'user@example.com',
//           first_name: user.firstName || 'User',
//           last_name: user.lastName || 'Test',
//           phone_number: user.phoneNumber,
//           apartment: 'NA',
//           floor: 'NA',
//           street: user.address,
//           building: 'NA',
//           shipping_method: 'NA',
//           postal_code: user.postalCode || 'NA',
//           city: user.city,
//           country: user.country,
//           state: 'NA',
//         },
//         currency: 'EGP',
//         integration_id: this.integrationId,
//       }),
//     );
//     const paymentKey = paymentKeyResponse.data.token;

//     // 7. تحديث الطلب بمعلومات Paymob
//     await this.orderService.updateOrder(order.id, {
//       paymobOrderId,
//       paymentKey,
//     });

//     // 8. إرجاع الـ iFrame URL ومعلومات الطلب
//     return {
//       orderId: order.id,
//       iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
//     };
//   }

//   async handlePaymentCallback(query: any) {
//     const { success, order_id, transaction_id, hmac } = query;

//     // 1. التحقق من HMAC
//     const isValidHmac = this.verifyHmac(query, hmac);
//     if (!isValidHmac) {
//       throw new BadRequestException('Invalid HMAC signature');
//     }

//     // 2. البحث عن الطلب باستخدام paymobOrderId
//     const order = await this.orderService.findOrderByPaymobId(order_id);
//     if (!order) {
//       throw new BadRequestException('Order not found');
//     }

//     // 3. تحديث حالة الطلب وخصم المخزون
//     if (success === 'true') {
//       await this.orderService.updateOrder(order.id, {
//         isPaid: true,
//         paidAt: new Date(),
//         transactionId: transaction_id,
//       });

//       // 4. خصم المخزون
//       for (const item of order.orderItems) {
//         await this.productsService.updateProductForOrder(
//           item.productId._id.toString(),
//           item.quantity,
//         );
//       }

//       // 5. إفراغ الـ Cart
//       const cart = await this.cartService.getOrderCart(order.user.toString());
//       cart.cartItems = [];
//       cart.totalPrice = 0;
//       cart.totalPriceAfterDiscount = 0;
//       cart.coupons = [];
//       await cart.save();
//     } else {
//       await this.orderService.updateOrder(order.id, {
//         status: 'failed',
//       });
//     }

//     // 6. إرجاع رابط التوجيه للفرونت إند
//     return {
//       redirectUrl: `https://yourwebsite.com/payment-success?orderId=${order.id}&success=${success}`,
//     };
//   }

//   private verifyHmac(query: any, receivedHmac: string): boolean {
//     const crypto = require('crypto');
//     const sortedKeys = Object.keys(query)
//       .filter((key) => key !== 'hmac')
//       .sort();
//     const concatenated = sortedKeys.map((key) => query[key]).join('');
//     const calculatedHmac = crypto
//       .createHmac('sha512', this.hmacSecret)
//       .update(concatenated)
//       .digest('hex');
//     return calculatedHmac === receivedHmac;
//   }
// }