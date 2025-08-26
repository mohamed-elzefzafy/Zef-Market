import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from 'src/products/products.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './entities/cart.schema';
import { CouponModule } from 'src/coupon/coupon.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    JwtModule,
    ProductsModule,
    CouponModule
  ],
  exports:[CartService],
})
export class CartModule {}
