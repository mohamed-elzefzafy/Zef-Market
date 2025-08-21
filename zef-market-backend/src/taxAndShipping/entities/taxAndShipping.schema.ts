import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class TaxAndShipping {
  @Prop({
    type: Number,
    default : 0,
  })
  taxPrice: number;
  @Prop({
    type: Number,
    default : 0,
  })
  shippingPrice: number;
}

export const TaxAndShippingSchema = SchemaFactory.createForClass(TaxAndShipping);
