import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Brand>;
@Schema({ timestamps: true })
export class Brand {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: { url: String, public_id: String },
    _id: false,
    required: false,
  })
  image: { url: string; public_id: string };

  
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
