import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtPayloadType } from 'src/shared/types';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // @Post('add')
  //     @Roles([ UserRoles.USER])
  //   @UseGuards(AuthGuard)
  // async addToCart(
  //   @Body() createCartDto: CreateCartDto,
  //   @CurrentUser() user: JwtPayloadType,
  // ) {
  //   const userId = user.id; // assuming user موجود في req.user
  //   return this.cartService.addProductToCart(userId, createCartDto);
  // }

  @Post('add-to-cart')
         @Roles([ UserRoles.USER])
   @UseGuards(AuthGuard)
  async addToCart(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id; 
    return this.cartService.addProductToCart(userId, createCartDto);
  }

    @Patch('change-productQuantity-cart')
         @Roles([ UserRoles.USER])
   @UseGuards(AuthGuard)
  async changeCartproductQuantity(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id; 
    return this.cartService.changeCartproductQuantity(userId, createCartDto);
  }

    @Get('current-user-cart')
             @Roles([ UserRoles.USER])
   @UseGuards(AuthGuard)
  getCurrentUserCart(    @CurrentUser() user: JwtPayloadType,) {
      const userId = user.id; 
    return this.cartService.getCurrentUserCart(userId);
  }


  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
