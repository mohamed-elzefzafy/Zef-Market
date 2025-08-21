import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ type: String, required: true, minlength: 3 })
  text: string;

  @Prop({ type: Number, min: 0 })
  discount: number;

    @Prop({
      type: { url: String, public_id: String },
      _id: false,
      required: true,
    })
    image: { url: string; public_id: string };

}

export const BannerSchema = SchemaFactory.createForClass(Banner);


