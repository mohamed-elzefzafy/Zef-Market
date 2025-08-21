import {
  BadRequestException,
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

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly productsService: ProductsService,
  ) {}
  async create(createReviewDto: CreateReviewDto, user: JwtPayloadType) {
    const product = await this.productsService.findOne(createReviewDto.product);

    const userReview = await this.reviewModel.findOne({
      product: product._id,
      user: user.id,
    });
    if (userReview) {
      throw new BadRequestException('you have already reviewed this course');
    }
    const review = await this.reviewModel.create({
      ...createReviewDto,
      user: user.id,
    });

    product.reviewsNumber += 1;
    const productReviews = await this.reviewModel.find({
      product: product._id,
    });
    let productRating = 0;

    for (let i = 0; i < productReviews.length; i++) {
      productRating += productReviews[i].rating;
    }
    product.rating = productRating / productReviews.length;
    product.reviewsNumber = productReviews.length;
    await product.save();
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
      .sort({ course: 1, createdAt: 1 }) // ASC sorting
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
    const product = await this.productsService.findOne(review.product);
    const productReviews = await this.reviewModel.find({
      product: product._id,
    });
    let productRating = 0;

    for (let i = 0; i < productReviews.length; i++) {
      productRating += productReviews[i].rating;
    }
    product.rating = productRating / productReviews.length;
    product.reviewsNumber = productReviews.length;
    await product.save();
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
  // 1. تأكد إن الريفيو موجود
  const review = await this.reviewModel.findById(id);

  if (!review) {
    throw new NotFoundException(`There's no review with this id: ${id}`);
  }

  // 2. تأكد إن المستخدم هو صاحب الريفيو
  if (review.user.toString() !== user.id.toString()) {
    throw new UnauthorizedException('You are not allowed to access this route');
  }

  // 3. خزن المنتج قبل ما تحذف الريفيو
  const productId = review.product;

  // 4. احذف الريفيو
  await review.deleteOne();

  // 5. جيب المنتج المرتبط بالريفيو
  const product = await this.productsService.findOne(productId);

  if (!product) {
    throw new NotFoundException(`Product not found for review: ${id}`);
  }

  // 6. جيب كل الريفيوهات الباقية للمنتج
  const productReviews = await this.reviewModel.find({ product: product._id });

  // 7. احسب المتوسط الجديد
  if (productReviews.length > 0) {
    const totalRating = productReviews.reduce(
      (sum, r) => sum + r.rating,
      0,
    );
    product.rating = totalRating / productReviews.length;
  } else {
    product.rating = 0; // مافيش ريفيوهات -> التقييم صفر
  }

  // 8. حدث عدد الريفيوهات
  product.reviewsNumber = productReviews.length;

  // 9. احفظ التغييرات
  await product.save();

  // 10. رجّع رسالة نجاح
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
    throw new NotFoundException(`Product with id ${review.product} not found`);
  }


  await review.deleteOne();

  // هات الريفيوز المتبقية للبرودكت
  const productReviews = await this.reviewModel.find({
    product: product._id,
  });

  // لو فيه ريفيوهات احسب الريتنغ وعددهم
  if (productReviews.length > 0) {
    const totalRating = productReviews.reduce(
      (acc, curr) => acc + curr.rating,
      0,
    );
    product.rating = totalRating / productReviews.length;
    product.reviewsNumber = productReviews.length;
  } else {
    // مفيش أي ريفيوهات دلوقتي
    product.rating = 0;
    product.reviewsNumber = 0;
  }

  // احفظ التغييرات
  await product.save();

  return { message: `Review with id (${id}) has been removed` };
}


  getAdminReviewCount() {
    return this.reviewModel.countDocuments();
  }
}
