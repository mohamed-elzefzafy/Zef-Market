import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayloadType } from 'src/shared/types';
import { SubCategory } from './entities/subcategory.schema';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { CategoryService } from 'src/category/category.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}
  public async create(
    createSubCategoryDto: CreateSubCategoryDto,
    file: Express.Multer.File,
  ) {
    const category = await this.categoryService.findOne(
      createSubCategoryDto.category,
    );

    let subCategory = await this.subCategoryModel.findOne({
      title: createSubCategoryDto.title,
      category: createSubCategoryDto.category,
    });

    if (subCategory)
      throw new BadRequestException(
        `subCategory ${subCategory.title} in ${category.title} is exist already`,
      );
    if (!file) throw new BadRequestException('image is required');
    let image = {};
    if (file) {
      const result = await this.cloudinaryService.uploadImage(
        file,
        'subCategories',
      );
      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    subCategory = await this.subCategoryModel.create({
      ...createSubCategoryDto,
      image,
    });

    return subCategory;
  }

  public async findAll(page: number, limit: number, category: string) {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    // Calculate skip (offset) for pagination
    const skip = (pageNumber - 1) * limitNumber;

    let query = {};
    if (category) {
      query['category'] = category;
    }
    // Fetch paginated users and total count
    // const [categories, total] = await this.categoryRepository.findAndCount({
    //   skip,
    //   take: limitNumber,
    //   relations: { posts: true },
    // });

    const subCategories = await this.subCategoryModel
      .find(query)
      .sort({ role: 1, createdAt: 1 }) // ASC sorting
      .skip(skip)
      .limit(limitNumber)
    .populate('category')
      .exec();

    const total = await this.subCategoryModel.countDocuments(query).exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return response in desired format
    return {
      subCategories,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  public async findOne(id: string) {
    const subCategory = await this.subCategoryModel.findById(id).populate('category');
    if (!subCategory) throw new NotFoundException('subCategory not found');
    return subCategory;
  }

  public async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
    file: Express.Multer.File,
  ) {
    const subCategory = await this.findOne(id);
    if (!subCategory) {
      throw new NotFoundException('subCategory not found');
    }
    if (updateSubCategoryDto.title) {
    }

    if (updateSubCategoryDto.category) {
      await this.categoryService.findOne(updateSubCategoryDto.category);
    }
    const existSubCategory = await this.subCategoryModel.findOne({
      title: updateSubCategoryDto.title,
    });

    if (
      existSubCategory &&
      existSubCategory._id.toString() !== subCategory._id.toString()
    ) {
      throw new BadRequestException("there's existSubCategory with this name");
    }

    Object.assign(subCategory, updateSubCategoryDto);

    if (file) {
      if (subCategory.image) {
        await this.cloudinaryService.removeImage(subCategory.image.public_id);
      }

      const result = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      subCategory.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    await subCategory.save();
    return subCategory;
  }

  public async remove(id: string) {
    const subCategory = await this.findOne(id);
    if (!subCategory) {
      throw new NotFoundException('subCategory not found');
    }

    if (subCategory.image) {
      await this.cloudinaryService.removeImage(subCategory.image.public_id);
    }

    // const productsForCategory = await ProductModel.find({
    //   category: req.params.id,
    // });
    const productsForSubCategory =
      await this.productsService.findProductsToSubCategory(
        subCategory._id.toString(),
      );
    // const publicIds = productsForCategory.map(product => product.images.public_id);
    // let publicIds = [];

    productsForSubCategory.forEach((product) => {
      this.productsService.remove(product._id.toString());
    });

    //     let publicIds = productsForCategory.map((product) =>
    //       product.images.map((image) => image.public_id),
    //     );
    // console.log(publicIds);

    //     if (publicIds?.length > 0) {
    //       for (let i = 0; i < publicIds.length; i++) {
    //         await this.cloudinaryService.removeMultipleImages(publicIds[i]);
    //       }
    //     }

    //     await ProductModel.deleteMany({ category: req.params.id });

    await subCategory.deleteOne();

    return { message: `subCategory with id (${id}) was removed` };
  }

  async findSubCategoriesToCategory(categoryId: string) {
    await this.categoryService.findOne(categoryId);
    const subCategories = await this.subCategoryModel.find({
      category: categoryId,
    });
    return subCategories;
  }

  async getSubCategoriesCount() {
    return this.subCategoryModel.countDocuments();
  }

}
