import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateTaxAndShippingDto {
    @IsNumber({} , {message : "tax price must be a number"})
    @IsNotEmpty()
     taxRate: number;

     @IsNumber({} , {message : "shipping price must be a number"})
      @IsNotEmpty()
     shippingPrice: number; 
}
