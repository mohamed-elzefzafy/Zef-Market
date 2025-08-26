import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpplyCouponToCartDto {
  @IsNotEmpty()
  @IsString()
  couponName: string;
}
