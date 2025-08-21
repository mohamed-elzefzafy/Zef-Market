import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { PAGE_LIMIT_ADMIN } from 'src/shared/constants';

@Controller('v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get('admin-find-all-reviews')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  findAllAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = `${PAGE_LIMIT_ADMIN}`,
  ) {
    return this.reviewsService.findAllAdmin(+page, +limit);
  }

  
  @Get('find-all/:productId')
  findAll(@Param('productId', ParseObjectIdPipe) productId: string) {
    return this.reviewsService.findAll(productId);
  }

  // @Get()
  // @Roles([UserRoles.ADMIN])
  // @UseGuards(AuthGuard)
  // findAllAdmin() {
  //   return this.reviewsService.findAllAdmin();
  // }

  
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

    @Delete('admin-remove/:id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  removeAdmin(
    @Param('id', ParseObjectIdPipe) id: string,
    // @CurrentUser() user: JwtPayloadType,
  ) {
    return this.reviewsService.removeAdmin(id);
  }

  @Delete(':id')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayloadType) {
    return this.reviewsService.remove(id, user);
  }


}
