import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.schema';
import { JwtModule } from '@nestjs/jwt';
import { CartModule } from 'src/cart/cart.module';
import { ProductsModule } from 'src/products/products.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { TaxAndShippingModule } from 'src/taxAndShipping/taxAndShipping.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { UsersModule } from 'src/users/users.module';
import { PaypalModule } from 'src/paypal/paypal.module';
import { PaymobModule } from 'src/paymob/paymob.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    JwtModule,
    CloudinaryModule,
    CartModule,
    ProductsModule,
    CouponModule,
    UsersModule,
    TaxAndShippingModule,
    forwardRef(() => StripeModule),
    forwardRef(() => PaypalModule),
    forwardRef(() => PaymobModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
