import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Banner } from './entities/banner.schema';
import { Model } from 'mongoose';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<Banner>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(createBannerDto: CreateBannerDto, file: Express.Multer.File) {
    const bannersCount = await this.bannerModel.countDocuments();
    if (bannersCount >= 5) {
      throw new BadRequestException(`maximum 5 hero slider images allowed`);
    }
    if (!file) throw new BadRequestException('image is required');
    let image = {};
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file, 'banners');
      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    const banner = await this.bannerModel.create({
      ...createBannerDto,
      image,
    });

    return banner;
  }

  async findAll() {
    return await this.bannerModel.find();
  }

  async findOne(id: string) {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new NotFoundException(`there's no banner with this is :  ${id} `);
    }
    return banner;
  }

  async update(
    id: string,
    updateBannerDto: UpdateBannerDto,
    file: Express.Multer.File,
  ) {
    const banner = await this.findOne(id);

    Object.assign(banner, updateBannerDto);

    if (file) {
      if (banner.image) {
        await this.cloudinaryService.removeImage(banner.image.public_id);
      }

      const result = await this.cloudinaryService.uploadImage(file, 'banners');
      banner.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    await banner.save();

    return banner;
  }

  async remove(id: string) {
    const banner = await this.findOne(id);

    await this.cloudinaryService.removeImage(banner.image.public_id);

    await banner.deleteOne();

    return { message: `banner with id (${id}) was removed` };
  }

      getAdminBannersCount() {
    return this.bannerModel.countDocuments();
  }
}
