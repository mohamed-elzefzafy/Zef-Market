import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxAndShipping, TaxAndShippingSchema } from './entities/taxAndShipping.schema';
import { TaxAndShippingController } from './taxAndShipping.controller';
import { TaxAndShippingService } from './taxAndShipping.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name : TaxAndShipping.name , schema :TaxAndShippingSchema}]),
  JwtModule,
  ],
  controllers: [TaxAndShippingController],
  providers: [TaxAndShippingService],
})
export class TaxAndShippingModule {}
