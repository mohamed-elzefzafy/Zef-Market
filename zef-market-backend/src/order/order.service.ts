import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly couponService: CouponService,
    private readonly taxAndShippingService: TaxAndShippingService,
    private readonly stripeService: StripeService,
  ) {}

  // async createOrder(createOrderDto: CreateOrderDto, userId: string) {
  //   // const { cartId, paymentMethod } = createOrderDto;

  //   // 1. هات الكارت
  //   const cart = await this.cartService.getOrderCart(userId);
  //   console.log('cart', cart);

  //   if (cart.cartItems.length === 0) {
  //     throw new BadRequestException('Cart is empty');
  //   }

  //   let totalOrderPrice = 0;

  //   // 2. تحقق من المنتجات
  //   for (const item of cart.cartItems) {
  //     // const product = await this.productsService.findOne(item.productId._id.toString());
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
  //   console.log('totalOrderPrice', totalOrderPrice);

  //   // 3. تطبيق الكوبونات (لو موجودة في cart)
  //   let discount = 0;
  //   if (cart.coupons && cart.coupons.length > 0) {
  //     for (const c of cart.coupons) {
  //       const coupon = await this.couponService.findOneById(c._id.toString());
  //       if (!coupon) continue;
  //       // Apply coupon logic (مثلاً نسبة خصم)
  //       if (coupon.discount) {
  //         discount += coupon.discount;
  //       }
  //     }
  //   }
  //   let totalOrderPriceAfterDiscount = 0;
  //   let tax = 0;
  //   let shipping = 0;
  //   const taxAndShipping = await this.taxAndShippingService.findAll();
  //   console.log('taxAndShipping', taxAndShipping);
  //   if (taxAndShipping) {
  //     totalOrderPriceAfterDiscount =
  //       totalOrderPrice -
  //       discount -
  //       ((taxAndShipping?.taxRate * totalOrderPrice)/100)-
  //       taxAndShipping.shippingPrice;

  //       tax = taxAndShipping?.taxRate 
  //       shipping = taxAndShipping.shippingPrice;
  //   } else {
  //     totalOrderPriceAfterDiscount = totalOrderPrice - discount;
  //   }

  //   // 4. أنشئ الأوردر
  //   const order = await this.orderModel.create({
  //     user: new Types.ObjectId(userId),
  //     orderItems: cart.cartItems.map((item) => ({
  //       productId: item.productId,
  //       quantity: item.quantity,
  //       price: item.price,
  //       finalPrice: item.finalPrice,
  //     })),
  //     totalOrderPrice,
  //     totalOrderPriceAfterDiscount,
  //     discount,
  //     tax: taxAndShipping?.taxRate ?? 0,
  //     shipping: taxAndShipping?.shippingPrice ?? 0,
  //     paymentMethodType: createOrderDto.paymentMethodType,
  //   });

  //   // const {} = await this.cartService.getCurrentUserCart(u)
  //   // 5. خصم من المخزون
  //   for (const item of cart.cartItems) {
  //     await this.productsService.updateProductForOrder(
  //       item.productId._id.toString(),
  //       item.quantity,
  //     );
  //   }

  //   // 6. امسح الكارت بعد إنشاء الأوردر
  //   cart.cartItems = [];
  //   cart.totalPrice = 0;
  //   cart.totalPriceAfterDiscount = 0;
  //   cart.coupons = [];
  //   await cart.save();

  //   return order;
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
  if (createOrderDto.paymentMethodType === 'card') {
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

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
