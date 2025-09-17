import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from 'src/products/entities/product.schema';
import { User } from 'src/users/entities/user.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: String, required: true, minlength: 3 })
  comment: string;

  @Prop({ type: Number, min: 0 })
  rating: number;

    @Prop({
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User.name,
    })
    user: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Product.name,
  })
  product: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);