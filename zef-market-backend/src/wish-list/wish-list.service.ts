import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishListDto } from './dto/create-wish-list.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/entities/user.schema';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class WishListService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly productsService: ProductsService,
  ) {}
  async create(createWishListDto: CreateWishListDto, userId: string) {
    const course = await this.productsService.findOne(
      createWishListDto.product,
    );

    const user = await this.userModel.findById(userId);
    if (
      user?.wishlist.find(
        (w) => w._id.toString() === createWishListDto.product.toString(),
      )
    ) {
      throw new BadRequestException('the product as already in your wishList');
    }

    user?.wishlist.push(new Types.ObjectId(createWishListDto.product));
    await user?.save();
    return user;
  }

  async findAllCurrentUserWishlist(
    userId: string,
    page: number,
    limit: number,
  ) {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);
    const skip = (pageNumber - 1) * limitNumber;

    const currentUser = await this.userModel
      .findById(userId)
      .populate({
        path: 'wishlist',
        options: {
          skip,
          limit: limitNumber,
        },
      })
      .exec();

    const total = await this.userModel
      .findById(userId)
      .then((u) => u?.wishlist.length ?? 0);

    const pagesCount = Math.ceil(total / limitNumber);

    return {
      wishlist: currentUser?.wishlist,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  async update(id: string, userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let wishListArr: Types.ObjectId[] = user.wishlist ?? [];

    // فلترة الـ ObjectId بالـ string
    wishListArr = wishListArr.filter((w) => w.toString() !== id.toString());

    user.wishlist = wishListArr;
    await user.save();

return user;
  }


}
