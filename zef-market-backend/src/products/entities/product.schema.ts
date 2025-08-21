import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Brand } from 'src/brand/entities/brand.schema';
import { Category } from 'src/category/entities/category.schema';
import { SubCategory } from 'src/subcategory/entities/subcategory.schema';

export type UserDocument = HydratedDocument<Product>;
@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Category.name,
  })
  category: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: SubCategory.name,
  })
  subCategory: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default :null,
    ref: Brand.name,
  })
  brand: string | null;

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    required: true,
    _id: false,
    validate: [
      (val: any[]) => val.length > 0,
      'At least one image is required',
    ],
  })
  images: { url: string; public_id: string }[];

  @Prop({ type: Number, min: 0, max: 5 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviewsNumber: number;

  @Prop({ type: Number, default: 0 })
  sold: number;

  @Prop({ type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, min: 0, default: 0 })
  discount: number;

  @Prop({ type: Number, min: 0 })
  finalPrice: number;

  @Prop({ type: Number, min: 0 })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
