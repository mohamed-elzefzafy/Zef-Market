import { forwardRef, Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './entities/review.schema';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
      JwtModule,
      forwardRef(() => ProductsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports :[ReviewsService]
})
export class ReviewsModule {}
