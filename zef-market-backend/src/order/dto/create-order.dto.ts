import { IsNotEmpty, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsEnum(['cash', 'stripe' ,'paypal' , 'paymob'], { message: 'paymentMethodType must be either cash or stripe or paypal or paymob' })
  paymentMethodType: 'cash' | 'stripe' |'paypal' | 'paymob';
}