import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  HttpException,
  Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PAGE_LIMIT_ADMIN } from 'src/shared/constants';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('api/v1/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    createCouponDto: CreateCouponDto,
  ) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = `${PAGE_LIMIT_ADMIN}`,
  ) {
    return this.couponService.findAll(+page, +limit);
  }

  @Get(':id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  findOneById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.couponService.findOneById(id);
  }

  @Patch(':id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}
