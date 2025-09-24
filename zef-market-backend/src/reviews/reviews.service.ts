import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtPayloadType } from 'src/shared/types';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './entities/review.schema';
import { Model } from 'mongoose';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}
  async create(createReviewDto: CreateReviewDto, user: JwtPayloadType) {
    const product = await this.productsService.findOne(createReviewDto.product);
    const existringUser = await this.usersService.findOne(user.id);

    if (!existringUser) {
      throw new NotFoundException('user not found');
    }

    const userReview = await this.reviewModel.findOne({
      product: product._id,
      user: user.id,
    });
    if (userReview) {
      throw new BadRequestException('you have already reviewed this product');
    }
    const review = await this.reviewModel.create({
      ...createReviewDto,
      user: user.id,
    });
    await this.countProductReviewAndRating(createReviewDto.product);
    return review;
  }

  async findAll(productId: string) {
    await this.productsService.findOne(productId);
    const productReviews = await this.reviewModel
      .find({ product: productId })
      .populate('user');
    return productReviews;
  }

  public async findAllAdmin(page: number, limit: number) {
    // Ensure page and limit are positive integers
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    // Calculate skip (offset) for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch users and total count using Mongoose
    const reviews = await this.reviewModel
      .find()
      .sort({ productn: 1, createdAt: 1 }) // ASC sorting
      .populate('user')
      .populate('product')
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const total = await this.reviewModel.countDocuments().exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return paginated result
    return {
      reviews,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  async findOne(id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException(`there's no review with this id : ${id}`);
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    user: JwtPayloadType,
  ) {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException(`ther's no review with this id : ${id}`);
    }
    if (review.user.toString() !== user.id.toString()) {
      throw new UnauthorizedException(
        'you are not allowed to access this route',
      );
    }
    Object.assign(review, updateReviewDto);
    await review.save();
    const product = await this.productsService.findOne(review.product);
    await this.countProductReviewAndRating(product._id.toString());
    await review.save();
    return review;
  }

  // async remove(id: string, user: JwtPayloadType) {
  //   const review = await this.reviewModel.findById(id);

  //   if (!review) {
  //     throw new NotFoundException(`ther's no review with this id : ${id}`);
  //   }
  //   if (review.user.toString() !== user.id.toString()) {
  //     throw new UnauthorizedException(
  //       'you are not allowed to access this route',
  //     );
  //   }

  //   const reviewObj = review;

  //     await review.deleteOne();

  //   const product = await this.productsService.findOne(reviewObj.product);

  //   const productReviews = await this.reviewModel.find({
  //     product: product._id,
  //   });
  //   let productRating = 0;

  //   for (let i = 0; i < productReviews.length; i++) {
  //     productRating += productReviews[i].rating;
  //   }
  //   product.rating = productRating / productReviews.length;
  //   product.reviewsNumber = productReviews.length;
  //   await product.save();

  //   return { message: `Review with id (${id}) has removed` };
  // }

  async remove(id: string, user: JwtPayloadType) {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException(`There's no review with this id: ${id}`);
    }

    if (review.user.toString() !== user.id.toString()) {
      throw new UnauthorizedException(
        'You are not allowed to access this route',
      );
    }

    const productId = review.product;
    await review.deleteOne();
    const product = await this.productsService.findOne(productId);

    if (!product) {
      throw new NotFoundException(`Product not found for review: ${id}`);
    }

    await this.countProductReviewAndRating(product._id.toString());


    return { message: `Review with id (${id}) has been removed` };
  }

  // async removeAdmin(id: string) {
  //   const review = await this.findOne(id);
  //   console.log(review);

  //   // if (!review) {
  //   //   throw new NotFoundException(`ther's no review with this id : ${id}`);
  //   // }

  //   await this.productsService.findOne(review.product);

  //   await review.deleteOne();

  //   const product = await this.productsService.findOne(review.product);
  //   const productReviews = await this.reviewModel.find({
  //     product: product._id,
  //   });
  //   let productRating = 0;

  //   for (let i = 0; i < productReviews.length; i++) {
  //     productRating += productReviews[i].rating;
  //   }
  //   product.rating = productRating / productReviews.length;
  //   product.reviewsNumber = productReviews.length;
  //   await product.save();

  //   return { message: `Review with id (${id}) has removed` };
  // }

  async removeAdmin(id: string) {
    const review = await this.findOne(id);

    const product = await this.productsService.findOne(review.product);
    if (!product) {
      throw new NotFoundException(
        `Product with id ${review.product} not found`,
      );
    }

    await review.deleteOne();

    // // هات الريفيوز المتبقية للبرودكت
    // const productReviews = await this.reviewModel.find({
    //   product: product._id,
    // });

    // // لو فيه ريفيوهات احسب الريتنغ وعددهم
    // if (productReviews.length > 0) {
    //   const totalRating = productReviews.reduce(
    //     (acc, curr) => acc + curr.rating,
    //     0,
    //   );
    //   product.rating = totalRating / productReviews.length;
    //   product.reviewsNumber = productReviews.length;
    // } else {
    //   // مفيش أي ريفيوهات دلوقتي
    //   product.rating = 0;
    //   product.reviewsNumber = 0;
    // }

    // // احفظ التغييرات
    // await product.save();
      await this.countProductReviewAndRating(product._id.toString());

    return { message: `Review with id (${id}) has been removed` };
  }

  getAdminReviewCount() {
    return this.reviewModel.countDocuments();
  }

  async deleteProductReviews(productId: string): Promise<void> {
    await this.productsService.findOne(productId);
    await this.reviewModel.deleteMany({ product: productId });
  }

  async deleteUserReviews(userId: string): Promise<void> {
    await this.reviewModel.deleteMany({ user: userId });
  }

  async countProductReviewAndRating(productId: string) {
    const product = await this.productsService.findOne(productId);
    product.reviewsNumber -= 1;
    const productReviews = await this.reviewModel.find({
      product: product._id,
    });
    if (productReviews.length === 0) {
        product.rating = 0;
    product.reviewsNumber = 0;
    await product.save();
    return;
    }
    let productRating = 0;

    for (let i = 0; i < productReviews.length; i++) {
      productRating += productReviews[i].rating;
    }

    product.rating = productRating / productReviews.length;
    product.reviewsNumber = productReviews.length;
    await this.productsService.updateProductrating(
      productId,
      product.reviewsNumber,
      product.rating,
    );
    await product.save();
  }

  async getuserReviews(userId: string) {
    const reviews = await this.reviewModel.find({ user: userId });
    return reviews;
  }

    getAdminReviewsCount() {
    return this.reviewModel.countDocuments();
  }
}
