import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaxAndShipping } from './entities/taxAndShipping.schema';
import { CreateTaxAndShippingDto } from './dto/create-taxAndShipping.dto';

@Injectable()
export class TaxAndShippingService {
  constructor(
    @InjectModel(TaxAndShipping.name) private readonly taxAndShippingModel : Model<TaxAndShipping>
  ) {}
  public async create(createTaxAndShippingDto: CreateTaxAndShippingDto) {
   let tax = await this.taxAndShippingModel.findOne();
   if (!tax){
    tax = await this.taxAndShippingModel.create(createTaxAndShippingDto);
   } else {
    Object.assign(tax, createTaxAndShippingDto);
    await tax.save(); 
   }

 
   return {
     message: 'Tax created successfully',
     tax,
   }
  }

  public async findAll() {
    const tax = await this.taxAndShippingModel.findOne();
    return {
      message: 'Tax created successfully',
      tax,
    }
  }

  public async remove() {
    let tax = await this.taxAndShippingModel.findOne();
    if (!tax) throw new Error('Tax not found');
    tax.taxPrice = 0;
    tax.shippingPrice = 0;
 await tax.save();
    return {
      message: 'Tax deleted successfully',
    }
  }

}
