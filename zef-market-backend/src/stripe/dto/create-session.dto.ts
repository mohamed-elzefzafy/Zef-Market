import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSessionRequestDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'courseId must be a valid MongoDB ObjectId' })
  courseId: string;
}
