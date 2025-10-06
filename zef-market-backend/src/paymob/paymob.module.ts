import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymobService } from './paymob.service';
import { PaymobController } from './paymob.controller';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [HttpModule,   forwardRef(() => OrderModule)],
  providers: [PaymobService],
  controllers: [PaymobController],
  exports: [PaymobService],
})
export class PaymobModule {}
