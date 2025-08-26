import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtPayloadType } from 'src/shared/types';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { RemoveProductFromCartDto } from './dto/remove-product-cart.dto';
import { UpplyCouponToCartDto } from './dto/upply-coupon-to-cart.dto';

@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-to-cart')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  async addToCart(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id;
    return this.cartService.addProductToCart(userId, createCartDto);
  }

  @Patch('change-productQuantity-cart')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  async changeCartproductQuantity(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id;
    return this.cartService.changeCartproductQuantity(userId, createCartDto);
  }

  @Patch('remove-productFrom-cart')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  async removeProductFromCart(
    @Body() removeProductFromCartDto: RemoveProductFromCartDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id;
    return this.cartService.removeProductFromCart(
      userId,
      removeProductFromCartDto,
    );
  }

  @Patch('upply-coupon-to-cart')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  async upplyCouponToCart(
    @Body() upplyCouponToCartDto: UpplyCouponToCartDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id;
    return this.cartService.upplyCouponToCart(userId, upplyCouponToCartDto);
  }

  @Get('current-user-cart')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  getCurrentUserCart(@CurrentUser() user: JwtPayloadType) {
    const userId = user.id;
    return this.cartService.getCurrentUserCart(userId);
  }
}
