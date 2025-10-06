import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymobService } from './paymob.service';
import { PaymobController } from './paymob.controller';
import { OrderModule } from 'src/order/order.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/order/entities/order.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => OrderModule),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    JwtModule,
  ],
  providers: [PaymobService],
  controllers: [PaymobController],
  exports: [PaymobService],
})
export class PaymobModule {}
