import { Inject, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/order/entities/order.schema';
import { CartModule } from 'src/cart/cart.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ConfigModule,
    JwtModule,
    CartModule,
    ProductsModule,
  ],
  controllers: [StripeController],
  providers: [
    StripeService,
    {
      provide: Stripe,
      useFactory: (configService: ConfigService) =>
        new Stripe(configService.getOrThrow<string>('STRIPE_SECRET_KEY')),
      inject: [ConfigService],
    },
  ],
  exports:[StripeService],
})
export class StripeModule {}