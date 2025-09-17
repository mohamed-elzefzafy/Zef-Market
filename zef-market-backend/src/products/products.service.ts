import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtPayloadType } from 'src/shared/types';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.schema';
import { isValidObjectId, Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryService } from 'src/category/category.service';
import { SubCategoryService } from 'src/subcategory/subcategory.service';
import { BrandService } from 'src/brand/brand.service';
import { ReviewsService } from 'src/reviews/reviews.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => SubCategoryService))
    private readonly subCategoryService: SubCategoryService,
    @Inject(forwardRef(() => BrandService))
    private readonly brandService: BrandService,
      @Inject(forwardRef(() => ReviewsService))
    private readonly reviewsService: ReviewsService,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const existProduct = await this.productModel.findOne({
      name: createProductDto.title,
      category: createProductDto.category,
    });
    if (existProduct) {
      throw new BadRequestException(
        'there is already product under this category with this name',
      );
    }

    if (createProductDto.discount >= createProductDto.price) {
      throw new BadRequestException('the discount must be less than price');
    }
    if (!files || files.length === 0) {
      throw new BadRequestException('Upload at least one image');
    }
    const category = await this.categoryService.findOne(
      createProductDto.category,
    );
    const subCategory = await this.subCategoryService.findOne(
      createProductDto.subCategory,
    );
    if (subCategory.category.toString() !== category._id.toString()) {
      throw new BadRequestException(
        `this subCategory ${subCategory.title} don't belong to category ${category.title}`,
      );
    }

    if (createProductDto.brand) {
      await this.brandService.findOne(createProductDto.brand);
    }

    let uploadedProdutImages: {
      url: string;
      public_id: string;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.cloudinaryService.uploadImage(
        files[i],
        'products',
      );

      uploadedProdutImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    let finalPrice: number = createProductDto.price;
    if (createProductDto.discount > 0) {
      finalPrice = createProductDto.price - createProductDto.discount;
    }

    const product = await this.productModel.create({
      ...createProductDto,
      images: uploadedProdutImages,
      finalPrice,
    });

    return product;
  }

  // public async findAll(
  //   page: number,
  //   limit: number,
  //   category?: string,
  //   subCategory?: string,
  //   brand?: string,
  //   search?: string,
  // ) {
  //   const pageNumber = Math.max(1, page);
  //   const limitNumber = Math.max(1, limit);
  //   const skip = (pageNumber - 1) * limitNumber;

  //   // Build filter object
  //   const filter: any = {};

  //   if (category) filter.category = category;
  //   if (subCategory) filter.subCategory = subCategory;
  //   if (brand) filter.brand = brand;

  //   if (search) {
  //     filter.$or = [
  //       { title: { $regex: search, $options: 'i' } },
  //       { description: { $regex: search, $options: 'i' } },
  //     ];
  //   }

  //   // Build query
  //   const query = this.productModel
  //     .find(filter)
  //     .populate('category')
  //     .populate('subCategory')
  //     .populate('brand');

  //   const products = await query
  //     .sort({ createdAt: -1 }) // or your custom sorting
  //     .skip(skip)
  //     .limit(limitNumber)
  //     .exec();

  //   const total = await this.productModel.countDocuments(filter).exec();

  //   const pagesCount = Math.ceil(total / limitNumber);

  //   return {
  //     products,
  //     pagination: {
  //       total,
  //       page: pageNumber,
  //       limit: limitNumber,
  //       pagesCount,
  //     },
  //   };
  // }

  public async findAll(
    page: number,
    limit: number,
    category?: string,
    subCategory?: string,
    brand?: string,
    keyword?: string,
    rating?: number, // NEW
    sortByPrice?: 'asc' | 'desc', // NEW
  ) {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter: any = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = brand;

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (typeof rating === 'number') {
      filter.rating = { $gte: rating };
    }

    const query = this.productModel
      .find(filter)
      .populate('category')
      .populate('subCategory')
      .populate('brand');

    // ✅ لو فيه sortByPrice استخدمه لوحده. لو مفيش يبقى الافتراضي createdAt
    const sort: Record<string, 1 | -1> = sortByPrice
      ? { finalPrice: sortByPrice === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

    const [products, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limitNumber).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const pagesCount = Math.ceil(total / limitNumber);

    return {
      products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .populate('subCategory')
      .populate('brand');
    if (!product) {
      throw new NotFoundException(`product with id ${id} not found`);
    }

    return product;
  }

  async findRelatedProduct(id: string) {
    const product = await this.findOne(id);
    let relatedProducts: Product[] = [];
    if (product.brand) {
      relatedProducts = await this.productModel
        .find({
          category: product.category,
          subCategory: product.subCategory,
          brand: product.brand,
        }).populate('category').populate('subCategory').populate('brand').limit(5);
    } else {
      relatedProducts = await this.productModel
        .find({
          category: product.category,
          subCategory: product.subCategory,
        }).populate('category').populate('subCategory').limit(5);
    }
    return relatedProducts;
  }

  async findOneForCart(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      return null;
    }

    return product;
  }

  async findProductsToSubCategory(subCategoryId: string) {
    await this.subCategoryService.findOne(subCategoryId);
    const products = await this.productModel.find({
      subCategory: subCategoryId,
    });
    return products;
  }
  async findProductsToBrand(brandId: string) {
    await this.brandService.findOne(brandId);
    const products = await this.productModel.find({
      brand: brandId,
    });
    return products;
  }

  async makeBrandNullAfterDeleteBrand(productId: string) {
    const product = await this.findOne(productId);
    product.brand = null;
    await product.save();
    return { message: 'brand attr became null after delete brand' };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    if (files && files?.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        await this.cloudinaryService.removeImage(product.images[i].public_id);
      }

      let uploadedProdutImages: {
        url: string;
        public_id: string;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const result = await this.cloudinaryService.uploadImage(
          files[i],
          'products',
        );

        uploadedProdutImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      product.images = uploadedProdutImages;
    }
    product.finalPrice = product.price - product.discount;
    if (product.finalPrice <= 0) {
      throw new BadRequestException('the discount must be less than price');
    }
    await product.save();
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.reviewsService.deleteProductReviews(product._id.toString());

    for (let i = 0; i < product.images.length; i++) {
      await this.cloudinaryService.removeImage(product.images[i].public_id);
    }

    await product.deleteOne();
    return { message: `product with id ${id} deleted successfully` };
  }

  async checkProductsForOrder(
    productId: string,
    quantity: number,
  ): Promise<Product | null> {
    const product = await this.productModel.findOne({
      _id: productId,
      stock: { $gte: quantity },
    });
    if (!product) {
      throw new NotFoundException(`product with id ${productId} not found`);
    }
    return product;
  }

  async updateProductForOrder(
    productId: string,
    quantity: number,
  ): Promise<void> {
    // await this.productModel.updateOne(

    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: -quantity, sold: quantity } },
    );
    //     { _id: item.productId },
    //     { $inc: { countInStock: -item.quantity, sales: item.quantity } },
    //   );
  }

  async updateProductrating(productId: string, reviewsNumber: number , rating:number) {
const product = await this.findOne(productId);
product.reviewsNumber = reviewsNumber;
product.rating = rating;
await product.save();
return product;
  }
}
