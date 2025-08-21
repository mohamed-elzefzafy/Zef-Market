import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/products/entities/product.schema';
import { User } from 'src/users/entities/user.schema';
import { Coupon } from 'src/coupon/entities/coupon.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId; // أو: Types.ObjectId | Product

  @Prop({ type: Number, min: 1, default: 1 })
  quantity: number;

  // لقطة من السعر وقت إضافة المنتج (تحميك لو الأسعار اتغيّرت)
  @Prop({ type: Number })
  price?: number;

  @Prop({ type: Number })
  finalPrice?: number;

  // لو محتاج ألوان فعّل السطرين دول
  // @Prop({ type: String, default: '' })
  // color?: string;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: [CartItemSchema], default: [] })
  cartItems: CartItem[];

  @Prop({ type: Number, default: 0, required: true })
  totalPrice: number; // إجمالي قبل الخصم

  @Prop({ type: Number })
  totalPriceAfterDiscount?: number; // إجمالي بعد الخصم (لو فيه كوبونات)

  @Prop({
    type: [
      {
        name: { type: String, trim: true },
        couponId: { type: Types.ObjectId, ref: Coupon.name },
      },
    ],
    default: [],
  })
  coupons: { name: string; couponId: Types.ObjectId }[];

  // كارت واحد لليوزر (unique) — فعل/الغها حسب تصميمك
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  user: Types.ObjectId;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// اختياري: أعِد حساب الإجماليات تلقائياً قبل الحفظ
// CartSchema.pre('save', function (next) {
//   const cart = this as unknown as Cart;
//   const subtotal = (cart.cartItems || []).reduce((sum, item) => {
//     const price = item.unitPrice ?? 0;
//     return sum + price * item.quantity;
//   }, 0);

//   cart.totalPrice = subtotal;

//   // لو عندك لوجيك للخصومات/الكوبونات، احسب totalPriceAfterDiscount هنا
//   // مثال بسيط (بدون قواعد كوبونات حقيقية):
//   // const discount = 0; // احسبه حسب الكوبونات
//   // cart.totalPriceAfterDiscount = Math.max(0, subtotal - discount);

//   next();
// });
