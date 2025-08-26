import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RemoveProductFromCartDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'productId must be a valid MongoDB ObjectId' })
  productId: string;
}
