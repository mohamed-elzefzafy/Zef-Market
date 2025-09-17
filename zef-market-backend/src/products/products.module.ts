import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.schema';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CategoryModule } from 'src/category/category.module';
import { SubCategoryModule } from 'src/subcategory/subcategory.module';
import { BrandModule } from 'src/brand/brand.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    JwtModule,
    CloudinaryModule,
    forwardRef(() => ReviewsModule),
    forwardRef(() => BrandModule),
    forwardRef(() => SubCategoryModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
