import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 30)
  description: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Category must be a valid MongoDB ObjectId' })
  category: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'SubCategory must be a valid MongoDB ObjectId' })
  subCategory: string;

  @IsOptional()
  @IsMongoId({ message: 'Brand must be a valid MongoDB ObjectId' })
  brand: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;
}
