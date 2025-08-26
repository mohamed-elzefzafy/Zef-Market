import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { CreateWishListDto } from './dto/create-wish-list.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('api/v1/wish-list')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @Post()
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  create(
    @Body() createWishListDto: CreateWishListDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.wishListService.create(createWishListDto, user.id);
  }

  @Get('get-my-wishlist')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  findAllCurrentUserWishlist(
    @CurrentUser() user: JwtPayloadType,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.wishListService.findAllCurrentUserWishlist(
      user.id,
      +page,
      +limit,
    );
  }

  @Patch(':id')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  removeFromWishlist(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.wishListService.update(id, user.id);
  }
}
