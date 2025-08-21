import { Module } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { WishListController } from './wish-list.controller';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';
import { ProductsModule } from 'src/products/products.module';
import { User, UserSchema } from 'src/users/entities/user.schema';

@Module({
  controllers: [WishListController],
  providers: [WishListService],
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProductsModule,
  ],
})
export class WishListModule {}
