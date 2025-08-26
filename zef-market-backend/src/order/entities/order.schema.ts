import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/entities/user.schema';
import { Product } from 'src/products/entities/product.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number })
  finalPrice: number;

  // @Prop({ type: String, default: '' })
  // color?: string;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  orderItems: OrderItem[];

  @Prop({ type: Number, default: 0 })
  taxPrice: number;

  @Prop({ type: Number, default: 0 })
  shippingPrice: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalOrderPrice: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalOrderPriceAfterDiscount: number;

  @Prop({ type: Number, required: true, default: 0 })
  discount: number;

  @Prop({ type: Number, required: true, default: 0 })
  tax: number;

  @Prop({ type: Number, required: true, default: 0 })
  shipping: number;

  @Prop({ type: String, enum: ['cash', 'card'], default: 'card' })
  paymentMethodType: string;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: Boolean, default: false })
  isDelivered: boolean;

  @Prop({ type: Date })
  deliveredAt?: Date;

  // @Prop({
  //   type: {
  //     street: { type: String, required: true },
  //     city: { type: String, required: true },
  //     country: { type: String, required: true },
  //     postalCode: { type: String },
  //   },
  //   required: true,
  // })
  // shippingAddress: {
  //   street: string;
  //   city: string;
  //   country: string;
  //   postalCode?: string;
  // };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
