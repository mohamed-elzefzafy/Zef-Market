// import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
// import axios from "axios";

// @Injectable()
// export class PaymobService {
//   private readonly apiKey = process.env.PAYMOB_API_KEY; // خدها من .env
//   private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID; // Integration ID من Dashboard
//   private readonly iframeId = process.env.PAYMOB_IFRAME_ID; // Iframe ID من Dashboard

//   private readonly baseUrl = "https://accept.paymob.com/api";

//   // ✅ 1) Get Auth Token
//   private async getAuthToken(): Promise<string> {
//     try {
//       const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
//         api_key: this.apiKey,
//       });
//       return response.data.token;
//     } catch (err) {
//       throw new HttpException(
//         "Failed to get Paymob token",
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

//   // ✅ 2) Create Order
//   private async createPaymobOrder(
//     authToken: string,
//     amountCents: number,
//   ): Promise<number> {
//     try {
//       const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
//         auth_token: authToken,
//         delivery_needed: false,
//         amount_cents: amountCents.toString(), // لازم string
//         currency: "EGP",
//         items: [],
//       });
//       return response.data.id; // orderId من Paymob
//     } catch (err) {
//       throw new HttpException(
//         "Failed to create Paymob order",
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

//   // ✅ 3) Get Payment Key
//   private async getPaymentKey(
//     authToken: string,
//     amountCents: number,
//     orderId: number,
//   ): Promise<string> {
//     try {
//       const response = await axios.post(
//         `${this.baseUrl}/acceptance/payment_keys`,
//         {
//           auth_token: authToken,
//           amount_cents: amountCents.toString(),
//           currency: "EGP",
//           order_id: orderId,
//           billing_data: {
//             apartment: "NA",
//             email: "test@example.com",
//             floor: "NA",
//             first_name: "Test",
//             street: "NA",
//             building: "NA",
//             phone_number: "+201234567890",
//             shipping_method: "PKG",
//             postal_code: "NA",
//             city: "Cairo",
//             country: "EG",
//             last_name: "User",
//             state: "Cairo",
//           },
//           integration_id: this.integrationId,
//         },
//       );

//       return response.data.token; // payment_key
//     } catch (err) {
//       throw new HttpException(
//         "Failed to get Paymob payment key",
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

//   // ✅ 4) Create Order Checkout Session (main function)
//   async createOrderCheckoutSession(
//     amount: number, // السعر بالجنيه * 100 (amount_cents)
//   ): Promise<{ iframeUrl: string; orderId: number }> {
//     const authToken = await this.getAuthToken();
//     const orderId = await this.createPaymobOrder(authToken, amount);
//     const paymentKey = await this.getPaymentKey(authToken, amount, orderId);

//     // الـ iframe URL النهائي
//     const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;

//     return { iframeUrl, orderId };
//   }
// }




import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from "@nestjs/common";
import axios from "axios";
import { OrderService } from "src/order/order.service";

@Injectable()
export class PaymobService {
  private readonly apiKey = process.env.PAYMOB_API_KEY;
  private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID;
  private readonly iframeId = process.env.PAYMOB_IFRAME_ID;
  private readonly baseUrl = "https://accept.paymob.com/api";

  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  // ✅ 1) Get Auth Token
  private async getAuthToken(): Promise<string> {
    const { data } = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: this.apiKey,
    });
    return data.token;
  }

  // ✅ 2) Create Paymob Order
  private async createPaymobOrder(authToken: string, amountCents: number, merchantOrderId: string): Promise<number> {
    const { data } = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents.toString(),
      currency: "EGP",
      merchant_order_id: merchantOrderId, // 👈 ربط أوردر Paymob بأوردرك المحلي
      items: [],
    });
    return data.id;
  }

  // ✅ 3) Get Payment Key
  private async getPaymentKey(authToken: string, amountCents: number, orderId: number): Promise<string> {
    const { data } = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, {
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
    });

    return data.token;
  }

  // ✅ 4) Create Order Checkout Session
  async createOrderCheckoutSession(amount: number, orderId: string): Promise<{ iframeUrl: string; orderId: number }> {
    const authToken = await this.getAuthToken();
    const paymobOrderId = await this.createPaymobOrder(authToken, amount * 100, orderId);
    const paymentKey = await this.getPaymentKey(authToken, amount * 100, paymobOrderId);

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;

    return { iframeUrl, orderId: paymobOrderId };
  }

  // ✅ 5) Handle Paymob Webhook
  // async handleWebhook(payload: any) {
  //   console.log('Paymob Webhook received:', payload);

  //   // Check if transaction was successful
  //   if (payload?.obj?.success && payload?.obj?.is_auth) {
  //     const merchantOrderId = payload.obj.merchant_order_id;
  //     const userId = payload.obj?.order?.user_id; // لو حابب تبعتها في metadata لاحقًا

  //     console.log('✅ Payment success for order:', merchantOrderId);

  //     // ✅ أنشئ الأوردر الفعلي بعد الدفع
  //     await this.orderService.createOrderDependOnPaymentMethod(userId, "paymob", merchantOrderId);
  //   } else {
  //     console.log('❌ Payment failed:', payload.obj);
  //   }

  //   return { received: true };
  // }


//   async handleWebhook(payload: any) {
//   console.log('Paymob Webhook received:', payload);

//   // استخدم القيم مباشرة من payload
//   const success = payload.success === 'true';
//   const isAuth = payload.is_auth === 'true';
//   const merchantOrderId = payload.merchant_order_id;
//   const orderId = payload.order; // أو أي id انت مخزنها

//   if (success && isAuth) {
//     console.log('✅ Payment success for order:', merchantOrderId);

//     // أنشئ الأوردر
//     await this.orderService.createOrderDependOnPaymentMethod(
//       payload.owner, // لو عايز userId ممكن تبعته في metadata وقت الدفع
//       'paymob',
//       merchantOrderId
//     );
//   } else {
//     console.log('❌ Payment failed:', payload);
//   }

//   return { received: true };
// }

async handleWebhook(payload: any) {
  console.log('Paymob Webhook received:', payload);

  const success = payload.success === 'true';
  const merchantOrderId = payload.merchant_order_id;
  

  if (success) {
    console.log('✅ Payment success for order:', merchantOrderId);

    await this.orderService.createOrderDependOnPaymentMethod(
      payload.owner, // userId لو حابب تبعته في metadata
      'paymob',
      merchantOrderId
    );
  } else {
    console.log('❌ Payment failed:', payload);
  }

  return { received: true };
}


}
