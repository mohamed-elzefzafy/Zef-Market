import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  rating: number;

  @IsNotEmpty()
  @IsString()
  @IsMongoId({ message: 'product must be a valid MongoDB ObjectId' })
  product: string;
}
