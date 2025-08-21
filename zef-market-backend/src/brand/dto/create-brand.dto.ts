import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    @Length(2 , 20)
    title : string;
}
