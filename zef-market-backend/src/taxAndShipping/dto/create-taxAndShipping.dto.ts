import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateTaxAndShippingDto {
    @IsNumber({} , {message : "tax price must be a number"})
    @IsNotEmpty()
     taxPrice: number;

     @IsNumber({} , {message : "shipping price must be a number"})
      @IsNotEmpty()
     shippingPrice: number; 
}
