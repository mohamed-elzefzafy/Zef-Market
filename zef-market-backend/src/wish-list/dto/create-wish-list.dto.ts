import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateWishListDto {
    @IsNotEmpty()
    @IsString()
    @IsMongoId({ message: 'course must be a valid MongoDB ObjectId' })
    product: string;
}
