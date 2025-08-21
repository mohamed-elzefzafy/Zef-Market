import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './entities/brand.schema';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    JwtModule,
    CloudinaryModule,
    forwardRef(() => ProductsModule),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
