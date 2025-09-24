import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaxAndShipping } from '../entities/taxAndShipping.schema';

@Injectable()
export class TaxAndShippingSeeder implements OnModuleInit {
  constructor(
    @InjectModel(TaxAndShipping.name)
    private taxAndShippingModel: Model<TaxAndShipping>,
  ) {}

  async onModuleInit() {
    const taxAndShipping = await this.taxAndShippingModel.find();
    if (taxAndShipping.length === 0) {
      await this.taxAndShippingModel.create({ taxRate: 0, shippingPrice: 0 });
      console.log('✅ Seeded tax and shipping.');
    }
  }
}
