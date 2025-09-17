import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { ProductsModule } from 'src/products/products.module';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule,
    CloudinaryModule,
    forwardRef(() => ReviewsModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => ReviewsModule),
  ],
  exports: [UsersService],
})
export class UsersModule {}
