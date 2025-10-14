// import {
//   Injectable,
//   HttpException,
//   HttpStatus,
//   Inject,
//   forwardRef,
// } from '@nestjs/common';
// import axios from 'axios';
// import { OrderService } from 'src/order/order.service';

// @Injectable()
// export class PaymobService {
//   private readonly apiKey = process.env.PAYMOB_API_KEY;
//   private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID;
//   private readonly iframeId = process.env.PAYMOB_IFRAME_ID;
//   private readonly baseUrl = 'https://accept.paymob.com/api';

//   constructor(
//     @Inject(forwardRef(() => OrderService))
//     private readonly orderService: OrderService,
//   ) {}

//   // ✅ 1) Get Auth Token
//   private async getAuthToken(): Promise<string> {
//     const { data } = await axios.post(`${this.baseUrl}/auth/tokens`, {
//       api_key: this.apiKey,
//     });
//     return data.token;
//   }

//   // ✅ 2) Create Paymob Order
//   private async createPaymobOrder(
//     authToken: string,
//     amountCents: number,
//     merchantOrderId: string,
//   ): Promise<number> {
//     const { data } = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
//       auth_token: authToken,
//       delivery_needed: false,
//       amount_cents: amountCents.toString(),
//       currency: 'EGP',
//       merchant_order_id: merchantOrderId, // 👈 ربط أوردر Paymob بأوردرك المحلي
//       items: [],
//     });
//     return data.id;
//   }

//   // ✅ 3) Get Payment Key
//   private async getPaymentKey(
//     authToken: string,
//     amountCents: number,
//     orderId: number,
//   ): Promise<string> {
//     const { data } = await axios.post(
//       `${this.baseUrl}/acceptance/payment_keys`,
//       {
//         auth_token: authToken,
//         amount_cents: amountCents.toString(),
//         currency: 'EGP',
//         order_id: orderId,
//         billing_data: {
//           apartment: 'NA',
//           email: 'test@example.com',
//           floor: 'NA',
//           first_name: 'Test',
//           street: 'NA',
//           building: 'NA',
//           phone_number: '+201234567890',
//           shipping_method: 'PKG',
//           postal_code: 'NA',
//           city: 'Cairo',
//           country: 'EG',
//           last_name: 'User',
//           state: 'Cairo',
//         },
//         integration_id: this.integrationId,
//       },
//     );

//     return data.token;
//   }

//   // ✅ 4) Create Order Checkout Session
//   async createOrderCheckoutSession(
//     amount: number,
//     orderId: string,
//   ): Promise<{ iframeUrl: string; orderId: number }> {
//     const authToken = await this.getAuthToken();
//     const paymobOrderId = await this.createPaymobOrder(
//       authToken,
//       amount * 100,
//       orderId,
//     );
//     const paymentKey = await this.getPaymentKey(
//       authToken,
//       amount * 100,
//       paymobOrderId,
//     );

//     const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;

//     return { iframeUrl, orderId: paymobOrderId };
//   }

//   // ✅ 5) Handle Paymob Webhook
//   // async handleWebhook(payload: any) {
//   //   console.log('Paymob Webhook received:', payload);

//   //   // Check if transaction was successful
//   //   if (payload?.obj?.success && payload?.obj?.is_auth) {
//   //     const merchantOrderId = payload.obj.merchant_order_id;
//   //     const userId = payload.obj?.order?.user_id; // لو حابب تبعتها في metadata لاحقًا

//   //     console.log('✅ Payment success for order:', merchantOrderId);

//   //     // ✅ أنشئ الأوردر الفعلي بعد الدفع
//   //     await this.orderService.createOrderDependOnPaymentMethod(userId, "paymob", merchantOrderId);
//   //   } else {
//   //     console.log('❌ Payment failed:', payload.obj);
//   //   }

//   //   return { received: true };
//   // }

//   //   async handleWebhook(payload: any) {
//   //   console.log('Paymob Webhook received:', payload);

//   //   // استخدم القيم مباشرة من payload
//   //   const success = payload.success === 'true';
//   //   const isAuth = payload.is_auth === 'true';
//   //   const merchantOrderId = payload.merchant_order_id;
//   //   const orderId = payload.order; // أو أي id انت مخزنها

//   //   if (success && isAuth) {
//   //     console.log('✅ Payment success for order:', merchantOrderId);

//   //     // أنشئ الأوردر
//   //     await this.orderService.createOrderDependOnPaymentMethod(
//   //       payload.owner, // لو عايز userId ممكن تبعته في metadata وقت الدفع
//   //       'paymob',
//   //       merchantOrderId
//   //     );
//   //   } else {
//   //     console.log('❌ Payment failed:', payload);
//   //   }

//   //   return { received: true };
//   // }

//   async handleWebhook(payload: any) {
//     console.log('Paymob Webhook received:', payload);

//     const success = payload.success === 'true';
//     const merchantOrderId = payload.merchant_order_id;

//     if (success) {
//       console.log('✅ Payment success for order:', merchantOrderId);

//       await this.orderService.createOrderDependOnPaymentMethod(
//         payload.owner, // userId لو حابب تبعته في metadata
//         'paymob',
//         merchantOrderId,
//       );
//     } else {
//       console.log('❌ Payment failed:', payload);
//     }

//     return { received: true };
//   }
// }



// import {
//   Injectable,
//   Inject,
//   forwardRef,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import axios from 'axios';
// import { OrderService } from 'src/order/order.service';

// @Injectable()
// export class PaymobService {
//   private readonly apiKey = process.env.PAYMOB_API_KEY;
//   private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID;
//   private readonly iframeId = process.env.PAYMOB_IFRAME_ID;
//   private readonly hmacSecret = process.env.PAYMOB_HMAC_SECRET;
//   private readonly baseUrl = process.env.PAYMOB_API_BASE || 'https://accept.paymob.com/api';
//   private readonly successUrl = process.env.PAYMOB_SUCCESS_URL;
//   private readonly cancelUrl = process.env.PAYMOB_CANCEL_URL;

//   constructor(
//     @Inject(forwardRef(() => OrderService))
//     private readonly orderService: OrderService,
//   ) {}

//   // ✅ 1) Auth Token
//   private async getAuthToken(): Promise<string> {
//     const { data } = await axios.post(`${this.baseUrl}/auth/tokens`, {
//       api_key: this.apiKey,
//     });
//     return data.token;
//   }

//   // ✅ 2) Create Paymob Order
//   private async createPaymobOrder(
//     authToken: string,
//     amountCents: number,
//     merchantOrderId: string,
//   ): Promise<number> {
//     const { data } = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
//       auth_token: authToken,
//       delivery_needed: false,
//       amount_cents: amountCents.toString(),
//       currency: 'EGP',
//       merchant_order_id: merchantOrderId,
//       items: [],
//     });
//     return data.id;
//   }

//   // ✅ 3) Get Payment Key (with user metadata)
//   private async getPaymentKey(
//     authToken: string,
//     amountCents: number,
//     orderId: number,
//     userId: string,
//   ): Promise<string> {
//     const { data } = await axios.post(
//       `${this.baseUrl}/acceptance/payment_keys`,
//       {
//         auth_token: authToken,
//         amount_cents: amountCents.toString(),
//         currency: 'EGP',
//         order_id: orderId,
//         integration_id: this.integrationId,
//         billing_data: {
//           apartment: 'NA',
//           email: 'test@example.com',
//           floor: 'NA',
//           first_name: 'User',
//           street: 'NA',
//           building: 'NA',
//           phone_number: '+201234567890',
//           shipping_method: 'PKG',
//           postal_code: 'NA',
//           city: 'Cairo',
//           country: 'EG',
//           last_name: 'Customer',
//           state: 'Cairo',
//         },
//       extras: {
//   userId, // لازم تكون نفس الـ userId اللي جاي من الـ frontend
// },
//       },
//     );
//     return data.token;
//   }

//   // ✅ 4) Create Order Checkout Session
  
//   async createOrderCheckoutSession(
//     amount: number,
//     orderId: string,
//     userId: string,
//   ): Promise<{ iframeUrl: string; orderId: number }> {
//     const authToken = await this.getAuthToken();
//     const paymobOrderId = await this.createPaymobOrder(
//       authToken,
//       amount * 100,
//       orderId,
//     );
//     const paymentKey = await this.getPaymentKey(
//       authToken,
//       amount * 100,
//       paymobOrderId,
//       userId,
//     );

//     const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
//     return { iframeUrl, orderId: paymobOrderId };
//   }

//   // ✅ 5) Handle Webhook (POST)
//   async handleWebhook(payload: any) {
//     try {
//       console.log('🔔 Paymob Webhook received:', payload);

//       const obj = payload?.obj;
//       if (!obj) {
//         console.log('❌ Invalid webhook payload');
//         return { received: false };
//       }

//       const success = obj.success === true;
//       const merchantOrderId = obj.merchant_order_id;
//       const userId = obj.order?.extras?.userId;

//       console.log('🟢 userId:', userId);
//       console.log('🟢 merchantOrderId:', merchantOrderId);

//       if (success && userId) {
//         console.log('✅ Payment success, creating order...');
//         await this.orderService.findOne(merchantOrderId, { id: userId } as any);

//         await this.orderService.createOrderDependOnPaymentMethod(
//           userId,
//           'paymob',
//           merchantOrderId,
//         );
//       } else {
//         console.log('❌ Payment failed or userId missing:', obj);
//       }

//       return { received: true };
//     } catch (err) {
//       console.error('🔥 Webhook error:', err);
//       throw new HttpException('Webhook processing failed', HttpStatus.BAD_REQUEST);
//     }
//   }
// }



// import {
//   Injectable,
//   Inject,
//   forwardRef,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import axios from 'axios';
// import { OrderService } from 'src/order/order.service';

// @Injectable()
// export class PaymobService {
//   private readonly apiKey = process.env.PAYMOB_API_KEY;
//   private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID;
//   private readonly iframeId = process.env.PAYMOB_IFRAME_ID;
//   private readonly hmacSecret = process.env.PAYMOB_HMAC_SECRET;
//   private readonly baseUrl =
//     process.env.PAYMOB_API_BASE || 'https://accept.paymob.com/api';
//   private readonly successUrl = process.env.PAYMOB_SUCCESS_URL;
//   private readonly cancelUrl = process.env.PAYMOB_CANCEL_URL;

//   constructor(
//     @Inject(forwardRef(() => OrderService))
//     private readonly orderService: OrderService,
//   ) {}

//   // ✅ 1) Auth Token
//   private async getAuthToken(): Promise<string> {
//     const { data } = await axios.post(`${this.baseUrl}/auth/tokens`, {
//       api_key: this.apiKey,
//     });
//     return data.token;
//   }

//   // ✅ 2) Create Paymob Order
//   private async createPaymobOrder(
//     authToken: string,
//     amountCents: number,
//     merchantOrderId: string,
//   ): Promise<number> {
//     const { data } = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
//       auth_token: authToken,
//       delivery_needed: false,
//       amount_cents: amountCents.toString(),
//       currency: 'EGP',
//       merchant_order_id: merchantOrderId,
//       items: [],
//     });
//     return data.id;
//   }

//   // ✅ 3) Get Payment Key
//   private async getPaymentKey(
//     authToken: string,
//     amountCents: number,
//     orderId: number,
//     userId: string,
//   ): Promise<string> {
//     const { data } = await axios.post(
//       `${this.baseUrl}/acceptance/payment_keys`,
//       {
//         auth_token: authToken,
//         amount_cents: amountCents.toString(),
//         currency: 'EGP',
//         order_id: orderId,
//         integration_id: this.integrationId,
//         billing_data: {
//           apartment: 'NA',
//           email: 'test@example.com',
//           floor: 'NA',
//           first_name: 'User',
//           street: 'NA',
//           building: 'NA',
//           phone_number: '+201234567890',
//           shipping_method: 'PKG',
//           postal_code: 'NA',
//           city: 'Cairo',
//           country: 'EG',
//           last_name: 'Customer',
//           state: 'Cairo',
//         },
//         extras: {
//           userId,
//         },
//       },
//     );
//     return data.token;
//   }

//   // ✅ 4) Create Checkout Session
//   // async createOrderCheckoutSession(
//   //   amount: number,
//   //   orderId: string,
//   //   userId: string,
//   // ): Promise<{ iframeUrl: string; orderId: number }> {
//   //   const authToken = await this.getAuthToken();
//   //   const paymobOrderId = await this.createPaymobOrder(
//   //     authToken,
//   //     amount * 100,
//   //     orderId,
//   //   );
//   //   const paymentKey = await this.getPaymentKey(
//   //     authToken,
//   //     amount * 100,
//   //     paymobOrderId,
//   //     userId,
//   //   );

//   //   const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
//   //   return { iframeUrl, orderId: paymobOrderId };
//   // }

//   async createOrderCheckoutSession(amount: number, orderId: string, userId: string) {
//   const integrationId = process.env.PAYMOB_INTEGRATION_ID;
//   const authToken = await this.getAuthToken();

//   // 🟣 1. أنشئ الـ order في Paymob وربط الـ orderId بتاعك معاه
//   const orderResponse = await axios.post(
//     'https://accept.paymob.com/api/ecommerce/orders',
//     {
//       auth_token: authToken,
//       delivery_needed: false,
//       amount_cents: Math.round(amount * 100),
//       currency: 'EGP',
//       merchant_order_id: orderId, // 👈 مهم جدًا
//       metadata: {
//         userId, // 👈 ده اللي نرجع نستخدمه في الـ webhook
//       },
//     },
//   );

//   const paymobOrder = orderResponse.data;

//   // 🟣 2. اعمل payment key
//   const paymentKeyResponse = await axios.post(
//     'https://accept.paymob.com/api/acceptance/payment_keys',
//     {
//       auth_token: authToken,
//       amount_cents: paymobOrder.amount_cents,
//       expiration: 3600,
//       order_id: paymobOrder.id,
//       billing_data: {
//         apartment: 'NA',
//         email: 'customer@example.com',
//         floor: 'NA',
//         first_name: 'Customer',
//         street: 'NA',
//         building: 'NA',
//         phone_number: '+201000000000',
//         shipping_method: 'NA',
//         postal_code: 'NA',
//         city: 'Cairo',
//         country: 'EG',
//         last_name: 'User',
//         state: 'NA',
//       },
//       currency: 'EGP',
//       integration_id: integrationId,
//     },
//   );

//   const paymentKey = paymentKeyResponse.data.token;

//   // 🟣 3. رجّع iframe URL
//   const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

//   return { iframeUrl, orderId: paymobOrder.id };
// }


//   // ✅ 5) Handle Webhook
//   async handleWebhook(payload: any) {
//     try {
//       console.log('🔔 Paymob Webhook received:', payload);

//       const obj = payload?.obj;
//       if (!obj) {
//         console.log('❌ Invalid webhook payload');
//         return { received: false };
//       }

//       const success = obj.success === true;
//       const merchantOrderId = obj.merchant_order_id;
//       const userId = obj.order?.extras?.userId;

//       console.log('🟢 userId:', userId);
//       console.log('🟢 merchantOrderId:', merchantOrderId);

//       if (success && userId) {
//         console.log('✅ Payment success, creating order...');
//         await this.orderService.createOrderDependOnPaymentMethod(
//           userId,
//           'paymob',
//           merchantOrderId,
//         );
//       } else {
//         console.log('❌ Payment failed or userId missing:', obj);
//       }

//       return { received: true };
//     } catch (err) {
//       console.error('🔥 Webhook error:', err);
//       throw new HttpException(
//         'Webhook processing failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

  

  
// }



import * as crypto from 'crypto';
import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class PaymobService {
  private readonly apiKey = process.env.PAYMOB_API_KEY;
  private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID;
  private readonly iframeId = process.env.PAYMOB_IFRAME_ID;
  private readonly hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  private readonly baseUrl =
    process.env.PAYMOB_API_BASE || 'https://accept.paymob.com/api';
  private readonly successUrl = process.env.PAYMOB_SUCCESS_URL;
  private readonly cancelUrl = process.env.PAYMOB_CANCEL_URL;

  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  // ✅ التحقق من الـ HMAC
  async verifyHmac(query: any): Promise<boolean> {
    if (!this.hmacSecret) {
      console.error('❌ PAYMOB_HMAC_SECRET is not defined in environment variables');
      throw new HttpException(
        'HMAC secret is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hmacReceived = query.hmac;
    if (!hmacReceived) {
      console.error('❌ No HMAC provided in webhook query');
      return false;
    }

    const hmacString = [
      query.amount_cents,
      query.created_at,
      query.currency,
      query.error_occured,
      query.has_parent_transaction,
      query.id,
      query.integration_id,
      query.is_3d_secure,
      query.is_auth,
      query.is_capture,
      query.is_refunded,
      query.is_standalone_payment,
      query.is_voided,
      query.order,
      query.owner,
      query.pending,
      query.source_data_pan,
      query.source_data_sub_type,
      query.source_data_type,
      query.success,
    ].join('');

    const hmacCalculated = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(hmacString)
      .digest('hex');

    return hmacReceived === hmacCalculated;
  }

  // ✅ 1) الحصول على Auth Token
  private async getAuthToken(): Promise<string> {
    const { data } = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: this.apiKey,
    });
    return data.token;
  }

  // ✅ 2) إنشاء Paymob Order
  private async createPaymobOrder(
    authToken: string,
    amountCents: number,
    merchantOrderId: string,
  ): Promise<number> {
    const { data } = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents.toString(),
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items: [],
      metadata: {
        merchantOrderId,
      },
    });
    return data.id;
  }

  // ✅ 3) الحصول على Payment Key
  private async getPaymentKey(
    authToken: string,
    amountCents: number,
    orderId: number,
    userId: string,
  ): Promise<string> {
    const { data } = await axios.post(
      `${this.baseUrl}/acceptance/payment_keys`,
      {
        auth_token: authToken,
        amount_cents: amountCents.toString(),
        currency: 'EGP',
        order_id: orderId,
        integration_id: this.integrationId,
        billing_data: {
          apartment: 'NA',
          email: 'test@example.com',
          floor: 'NA',
          first_name: 'User',
          street: 'NA',
          building: 'NA',
          phone_number: '+201234567890',
          shipping_method: 'PKG',
          postal_code: 'NA',
          city: 'Cairo',
          country: 'EG',
          last_name: 'Customer',
          state: 'Cairo',
        },
        extras: {
          userId,
        },
      },
    );
    return data.token;
  }

  // ✅ 4) إنشاء Checkout Session
  async createOrderCheckoutSession(
    amount: number,
    orderId: string,
    userId: string,
  ): Promise<{ iframeUrl: string; orderId: number }> {
    const authToken = await this.getAuthToken();
    const paymobOrderId = await this.createPaymobOrder(
      authToken,
      amount * 100,
      orderId,
    );
    const paymentKey = await this.getPaymentKey(
      authToken,
      amount * 100,
      paymobOrderId,
      userId,
    );

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
    return { iframeUrl, orderId: paymobOrderId };
  }

  // ✅ 5) معالجة الـ Webhook
  async handleWebhook(payload: any) {
    try {
      console.log('🔔 Paymob Webhook received:', payload);

      const obj = payload?.obj;
      if (!obj) {
        console.log('❌ Invalid webhook payload');
        return { received: false };
      }

      const success = obj.success === true;
      const merchantOrderId = obj.merchant_order_id;
      const userId = obj.order?.extras?.userId || payload.userId;

      console.log('🟢 userId:', userId);
      console.log('🟢 merchantOrderId:', merchantOrderId);

      if (success && userId && merchantOrderId) {
        console.log('✅ Payment success, updating order...');
        await this.orderService.createOrderDependOnPaymentMethod(
          userId,
          'paymob',
          merchantOrderId,
        );
      } else {
        console.log('❌ Payment failed or missing data:', obj);
      }

      return { received: true };
    } catch (err) {
      console.error('🔥 Webhook error:', err);
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}