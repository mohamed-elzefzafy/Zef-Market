import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { MailerModule } from '@nestjs-modules/mailer';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubCategoryModule } from './subcategory/subcategory.module';
import { BrandModule } from './brand/brand.module';
import { ProductsModule } from './products/products.module';
import { TaxAndShippingModule } from './taxAndShipping/taxAndShipping.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishListModule } from './wish-list/wish-list.module';
import { BannerModule } from './banner/banner.module';
import { CouponModule } from './coupon/coupon.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), 
    CloudinaryModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            service: 'gmail',
            auth: {
              user: config.get<string>('EMAIL_USERNAME'),
              pass: config.get<string>('EMAIL_PASSWORD'),
            },
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
        dbName: 'Zef-Market',
      }),
    }),
    CategoryModule,
    UsersModule,
    AuthModule,
    SubCategoryModule,
    BrandModule,
    ProductsModule,
    TaxAndShippingModule,
    ReviewsModule,
    WishListModule,
    BannerModule,
    CouponModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
