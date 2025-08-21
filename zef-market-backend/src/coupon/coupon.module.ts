import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, couponSchema } from './entities/coupon.schema';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: couponSchema }]),
    JwtModule,
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports:[CouponService],
})
export class CouponModule {}
