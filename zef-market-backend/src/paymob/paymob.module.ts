import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymobService } from './paymob.service';
import { PaymobController } from './paymob.controller';

@Module({
  imports: [HttpModule],
  providers: [PaymobService],
  controllers: [PaymobController],
  exports: [PaymobService],
})
export class PaymobModule {}

// import { forwardRef, Module } from '@nestjs/common';
// import { PaymobService } from './paymob.service';
// import { PaymobController } from './paymob.controller';
// import { CartService } from '../cart/cart.service';
// import { OrderService } from '../order/order.service';
// import { ProductsService } from '../products/products.service';
// import { UsersService } from '../users/users.service';
// import { CouponService } from '../coupon/coupon.service';
// import { HttpModule } from '@nestjs/axios';
// import { TaxAndShippingService } from 'src/taxAndShipping/taxAndShipping.service';
// import { OrderModule } from 'src/order/order.module';
// import { CartModule } from 'src/cart/cart.module';
// import { ProductsModule } from 'src/products/products.module';
// import { UsersModule } from 'src/users/users.module';
// import { CouponModule } from 'src/coupon/coupon.module';
// import { TaxAndShippingModule } from 'src/taxAndShipping/taxAndShipping.module';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Cart, CartSchema } from 'src/cart/entities/cart.schema';

// // @Module({
// //   imports: [
// //     // MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
// //     HttpModule,
// //     forwardRef(() => OrderModule),
// //     CartModule,
// //     ProductsModule,
// //     UsersModule,
// //     CouponModule,
// //     TaxAndShippingModule,
// //   ],
// //   controllers: [PaymobController],
// //   providers: [
// //     PaymobService,
// //     CartService,
// //     OrderService,
// //     ProductsService,
// //     UsersService,
// //     CouponService,
// //     TaxAndShippingService,
// //   ],
// // })
// // export class PaymobModule {}




// @Module({
//   imports: [
//     HttpModule,
//     forwardRef(() => OrderModule),
//     CartModule,        // فيه CartService + CartModel
//     ProductsModule,    // فيه ProductsService
//     UsersModule,       // فيه UsersService
//     CouponModule,      // فيه CouponService
//     TaxAndShippingModule, // فيه TaxAndShippingService
//   ],
//   controllers: [PaymobController],
//   providers: [PaymobService], // هنا بس PaymobService
//   exports: [PaymobService],
// })
// export class PaymobModule {}
