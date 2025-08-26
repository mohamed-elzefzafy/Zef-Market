import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon } from './entities/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private couponModule: Model<Coupon>) {}

  async create(createCouponDto: CreateCouponDto) {
    const coupon = await this.couponModule.findOne({
      name: createCouponDto.name.toUpperCase(),
    });
    if (coupon) {
      throw new BadRequestException(`Coupon with name : ${coupon.name} already exist`);
    }

    createCouponDto.name = createCouponDto.name.toUpperCase();
    // if (coupon) {
    //   throw new NotFoundException('Coupon already exist');
    // }

            const isExpired = new Date(createCouponDto.expireDate) > new Date();
    if (!isExpired) {
      throw new HttpException("Coupon can't be expired", 400);
    }

    const newCoupon = await this.couponModule.create(createCouponDto);
  return  newCoupon;
  }

  // async findAll() {
  //   const coupons = await this.couponModule.find();
  //   return {
  //     status: 200,
  //     message: 'Coupons found',
  //     length: coupons.length,
  //     data: coupons,
  //   };
  // }

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

    const coupons = await this.couponModule
      .find()
      .sort({ createdAt : "asc"}) // ASC sorting
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const total = await this.couponModule.countDocuments().exec();

    // Calculate total pages
    const pagesCount = Math.ceil(total / limitNumber);

    // Return response in desired format
    return {
      coupons,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pagesCount,
      },
    };
  }

  async findOneById(id: string) {
    const coupon = await this.couponModule.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

return coupon;
  }

    async findOneByName(couponName: string) {
    const coupon = await this.couponModule.findOne({name:couponName});
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

return coupon;
  }


//   async update(id: string, updateCouponDto: UpdateCouponDto) {
//     const coupon = await this.couponModule.findById(id);
//     if (!coupon) {
//       throw new NotFoundException('Coupon not found');
//     }
//   if (updateCouponDto.name) {
//       if(coupon.name.toUpperCase() === updateCouponDto.name.toUpperCase()) {
//       throw new BadRequestException(`Coupon with name : ${coupon.name} already exist`)
//     }
//   }
// if (updateCouponDto.expireDate) {
  
//         const isExpired = new Date(updateCouponDto.expireDate) > new Date();
//     if (!isExpired) {
//       throw new HttpException("Coupon can't be expired", 400);
//     }

// }
//   if (updateCouponDto.name) {
//       updateCouponDto.name = updateCouponDto.name.toUpperCase();
//   }
//     const updatedCoupon = await this.couponModule.findByIdAndUpdate(
//       id,
//       updateCouponDto,
//       {
//         new: true,
//       },
//     );
//     return updatedCoupon;
//   }

async update(id: string, updateCouponDto: UpdateCouponDto) {
  const coupon = await this.couponModule.findById(id);
  if (!coupon) {
    throw new NotFoundException('Coupon not found');
  }

  // لو فيه تحديث للاسم
  if (updateCouponDto.name) {
    const newName = updateCouponDto.name.toUpperCase();

    // ندور هل في كوبون تاني بنفس الاسم
    const existingCoupon = await this.couponModule.findOne({
      name: newName,
      _id: { $ne: id }, // استثني الكوبون اللي بيتم تحديثه
    });

    if (existingCoupon) {
      throw new BadRequestException(
        `Coupon with name : ${newName} already exists`,
      );
    }

    updateCouponDto.name = newName;
  }

  if (updateCouponDto.expireDate) {
    const isExpired = new Date(updateCouponDto.expireDate) > new Date();
    if (!isExpired) {
      throw new HttpException("Coupon can't be expired", 400);
    }
  }

  const updatedCoupon = await this.couponModule.findByIdAndUpdate(
    id,
    updateCouponDto,
    {
      new: true,
    },
  );

  return updatedCoupon;
}


  async remove(id: string) {
    const coupon = await this.findOneById(id);
 
    await coupon.deleteOne();

    return { message: `coupon with id (${id}) was removed` };
  }


async findSomeCouponsIds(couponsIds: string[]) {
  const coupons = await this.couponModule.find({
    _id: { $in: couponsIds },
  });

  const cloneCoupons = coupons.filter(coupon =>  new Date(coupon.expireDate) > new Date())
  return cloneCoupons;
}

}
