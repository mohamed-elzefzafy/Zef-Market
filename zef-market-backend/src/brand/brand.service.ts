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
import { Brand } from './entities/brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}
  public async create(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
  ) {
    let brand = await this.brandModel.findOne({
      title: createBrandDto.title,
    });

    if (brand) throw new BadRequestException('brand is exist already');
    if (!file) throw new BadRequestException('image is required');
    let image = {};
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file, 'brands');
      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    brand = await this.brandModel.create({ ...createBrandDto, image });

    return brand;
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

    const brands = await this.brandModel
      .find()
      .sort({ role: 1, createdAt: 1 }) // ASC sorting
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const total = await this.brandModel.countDocuments().exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return response in desired format
    return {
      brands,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  public async findOne(id: string) {
    const brand = await this.brandModel.findById(id);
    if (!brand) throw new NotFoundException('brand not found');
    return brand;
  }

  public async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    file: Express.Multer.File,
  ) {
    const brand = await this.findOne(id);
    if (!brand) {
      throw new NotFoundException('category not found');
    }
    const existBrand = await this.brandModel.findOne({
      title: updateBrandDto.title,
    });
    if (existBrand && existBrand._id.toString() !== brand._id.toString()) {
      throw new BadRequestException("there's category with this name");
    }

    Object.assign(brand, updateBrandDto);

    if (file) {
      if (brand.image) {
        await this.cloudinaryService.removeImage(brand.image.public_id);
      }

      const result = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      brand.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    await brand.save();
    return brand;
  }

  public async remove(id: string, user: JwtPayloadType) {
    const brand = await this.findOne(id);
    if (!brand) throw new NotFoundException('brand not found');

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

        const productsForBrand =
      await this.productsService.findProductsToBrand(
        brand._id.toString(),
      );
    // const publicIds = productsForCategory.map(product => product.images.public_id);
    // let publicIds = [];

    productsForBrand.forEach((product) => {
      this.productsService.makeBrandNullAfterDeleteBrand(product._id.toString());
    });


    if (brand.image) {
      await this.cloudinaryService.removeImage(brand.image.public_id);
    }
    await brand.deleteOne();

    return { message: `brand with id (${id}) was removed` };
  }

  async getBrandsCount() {
    return this.brandModel.countDocuments();
  }
}
