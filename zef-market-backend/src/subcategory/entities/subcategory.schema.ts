import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from 'src/category/entities/category.schema';

export type UserDocument = HydratedDocument<SubCategory>;
@Schema({ timestamps: true })
export class SubCategory {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Category.name,
  })
  category: string;

  @Prop({
    type: { url: String, public_id: String },
    _id: false,
    required: false,
  })
  image: { url: string; public_id: string };
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
