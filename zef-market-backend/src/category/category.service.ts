import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.schema';
import { Model } from 'mongoose';
import { JwtPayloadType } from 'src/shared/types';
import { SubCategoryService } from 'src/subcategory/subcategory.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => SubCategoryService))
    private readonly subCategoryService: SubCategoryService,
  ) {}
  public async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
  ) {
    let category = await this.categoryModel.findOne({
      title: createCategoryDto.title,
    });

    if (category) throw new BadRequestException('category is exist already');
    if (!file) throw new BadRequestException('image is required');
    let image = {};
    if (file) {
      const result = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    category = await this.categoryModel.create({ ...createCategoryDto, image });

    return category;
  }

  public async findAll(page: number, limit: number) {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    // Calculate skip (offset) for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated users and total count
    // const [categories, total] = await this.categoryRepository.findAndCount({
    //   skip,
    //   take: limitNumber,
    //   relations: { posts: true },
    // });

    const categories = await this.categoryModel
      .find()
      .sort({ role: 1, createdAt: 1 }) // ASC sorting
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const total = await this.categoryModel.countDocuments().exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return response in desired format
    return {
      categories,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  public async findOne(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('category not found');
    return category;
  }

  public async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File,
  ) {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('category not found');
    }
    const existCategory = await this.categoryModel.findOne({
      title: updateCategoryDto.title,
    });
    if (
      existCategory &&
      existCategory._id.toString() !== category._id.toString()
    ) {
      throw new BadRequestException("there's category with this name");
    }

    Object.assign(category, updateCategoryDto);

    if (file) {
      if (category.image) {
        await this.cloudinaryService.removeImage(category.image.public_id);
      }

      const result = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      category.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    await category.save();
    return category;
  }

  public async remove(id: string, user: JwtPayloadType) {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('category not found');

    // const courses = await this.courseService.getCoursesForSpecificCategory(id);
    // const posts = await this.postService.findCtegoryPosts(id);

    // let publicIds = [];
    // if (posts.length > 0) {
    //   posts.map((post) => {
    //     if (post.image) {
    //       publicIds.push(post.image.public_id);
    //     }
    //   });
    // }
    // if (publicIds.length > 0) {
    //   await this.cloudinaryService.removeMultipleImages(publicIds);
    // }

    // for (let i = 0; i < courses.length; i++) {
    //   await this.courseService.remove(courses[i]._id.toString(), user);
    // }
    if (category.image) {
      await this.cloudinaryService.removeImage(category.image.public_id);
    }

    const subCategoriesForCategory =
      await this.subCategoryService.findSubCategoriesToCategory(
        category._id.toString(),
      );
    // const publicIds = productsForCategory.map(product => product.images.public_id);
    // let publicIds = [];

    subCategoriesForCategory.forEach((subCategory) => {
      this.subCategoryService.remove(subCategory._id.toString());
    });

    await category.deleteOne();

    return { message: `category with id (${id}) was removed` };
  }

  async getCategoriesCount() {
    return this.categoryModel.countDocuments();
  }
}
