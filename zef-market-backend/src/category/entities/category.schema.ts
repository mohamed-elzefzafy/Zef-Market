import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Category>;
@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: { url: String, public_id: String },
    _id: false,
    required: false,
  })
  image: { url: string; public_id: string };

  
}

export const CategorySchema = SchemaFactory.createForClass(Category);
