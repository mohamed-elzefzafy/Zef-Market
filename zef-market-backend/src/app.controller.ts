import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from './auth/decorator/Roles.decorator';
import { UserRoles } from './shared/enums/roles.enum';
import { AuthGuard } from './auth/guards/auth.guard';
import { CategoryService } from './category/category.service';
import { UsersService } from './users/users.service';
import { ReviewsService } from './reviews/reviews.service';
import { ProductsService } from './products/products.service';
import { SubCategoryService } from './subcategory/subcategory.service';
import { BrandService } from './brand/brand.service';
import { OrderService } from './order/order.service';
import { BannerService } from './banner/banner.service';

@Controller()
export class AppController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly subCategoryService: SubCategoryService,
    private readonly brandService: BrandService,
    private readonly usersService: UsersService,
    private readonly reviewsService: ReviewsService,
    private readonly orderService: OrderService,
    private readonly bannerService: BannerService,
  ) {}

  @Get()
  getHello(): string {
    return 'welcome to Zef-Market Api';
  }

  @Get('get-admin-counts')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  async getAdminCounts() {
    const productsCount = await this.productsService.getAdminProductsCount();
    const categoriesCount = await this.categoryService.getCategoriesCount();
    const subCategoriesCount =
      await this.subCategoryService.getSubCategoriesCount();
    const brandsCount = await this.brandService.getBrandsCount();
    const usersCount = await this.usersService.getUsersCount();
    const reviewsCount = await this.reviewsService.getAdminReviewCount();
    const ordersCount = await this.orderService.getAdminOrdersCount();
    const bannersCount = await this.bannerService.getAdminBannersCount();

    return {
      productsCount,
      categoriesCount,
      subCategoriesCount,
      brandsCount,
      usersCount,
      reviewsCount,
      ordersCount,
      bannersCount,
    };
  }
}
