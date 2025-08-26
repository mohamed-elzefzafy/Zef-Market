import { IsNotEmpty, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsEnum(['cash', 'card'], { message: 'paymentMethodType must be either cash or card' })
  paymentMethodType: 'cash' | 'card';
}