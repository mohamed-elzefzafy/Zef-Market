import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  title: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Category must be a valid MongoDB ObjectId' })
  category: string;
}
