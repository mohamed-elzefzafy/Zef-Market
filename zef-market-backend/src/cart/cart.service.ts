import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ProductsService } from 'src/products/products.service';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './entities/cart.schema';
import { Model, Types } from 'mongoose';
import { CouponService } from 'src/coupon/coupon.service';
import { RemoveProductFromCartDto } from './dto/remove-product-cart.dto';
import { UpplyCouponToCartDto } from './dto/upply-coupon-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly productsService: ProductsService,
    private readonly couponService: CouponService,
  ) {}

  async addProductToCart(userId: string, createCartDto: CreateCartDto) {
    const product = await this.productsService.findOne(createCartDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      // لو مفيش كارت → اعمل واحد جديد
      cart = new this.cartModel({
        user: userId,
        cartItems: [
          {
            productId: product._id,
            quantity: createCartDto.quantity || 1,
            price: product.price,
            finalPrice: product.finalPrice,
          },
        ],
      });
      await cart.save();
    } else {
      // لو فيه كارت بالفعل
      const itemIndex = cart.cartItems.findIndex(
        (item) =>
          item.productId.toString() === createCartDto.productId.toString(),
      );
      console.log('itemIndex', itemIndex);

      if (itemIndex > -1) {
        // المنتج موجود → نزود الكمية
        if ((cart.cartItems[itemIndex].quantity + createCartDto.quantity) > product.stock) {
            throw new BadRequestException(`the product ${product.title} hasn't enough stock`)
        }
        cart.cartItems[itemIndex].quantity += createCartDto.quantity || 1;
      } else {
        // المنتج مش موجود → ضيفه
        if (product.stock < createCartDto.quantity) {
          throw new BadRequestException(`the product ${product.title} hasn't enough stock`)
        }
        cart.cartItems.push({
          productId: product._id,
          quantity: createCartDto.quantity || 1,
          price: product.price,
          finalPrice: product.finalPrice,
        });
      }
      await cart.save();
    }

    cart = await this.getCurrentUserCart(userId);
    return cart.populate('cartItems.productId');
  }

  async changeCartproductQuantity(
    userId: string,
    createCartDto: CreateCartDto,
  ) {
    const product = await this.productsService.findOne(createCartDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!createCartDto.quantity) {
      throw new NotFoundException('quantity not found');
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundException('cart not found');
    } else {
      // لو فيه كارت بالفعل
      const itemIndex = cart.cartItems.findIndex(
        (item) =>
          item.productId.toString() === createCartDto.productId.toString(),
      );
      console.log('itemIndex', itemIndex);

      if (itemIndex > -1) {
        // المنتج موجود → نزود الكمية
        cart.cartItems[itemIndex].quantity = createCartDto.quantity;

        await cart.save();
      } else {
        throw new NotFoundException('product not found in cart');
      }
    }

    cart = await this.getCurrentUserCart(userId);
    return cart.populate('cartItems.productId');
  }

  async upplyCouponToCart(
    userId: string,
    upplyCouponToCartDto: UpplyCouponToCartDto,
  ) {
    const coupon = await this.couponService.findOneByName(
      upplyCouponToCartDto.couponName,
    );

    const isExpired = new Date(coupon.expireDate) > new Date();
    if (!isExpired) {
      throw new NotFoundException("Coupon can't be expired");
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundException('cart not found');
    }
    if (
      cart.coupons.find((Coupon) => Coupon.toString() === coupon._id.toString())
    ) {
      throw new NotFoundException('coupon already used');
    }
    cart.coupons.push(coupon._id);

    await cart.save();

    cart = await this.getCurrentUserCart(userId);
    return cart.populate('cartItems.productId');
  }

  async getCurrentUserCart(userId: string) {
    const cart = await this.cartModel.findOne({ user: userId }).populate('cartItems.productId');;

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    // const validCartItems = cart.cartItems.filter((item) => item.productId);

    // cart.cartItems = validCartItems;

    // // لو كل المنتجات اتحذفت → cartItems فاضي
    // if (validCartItems.length === 0) {
    //   cart.cartItems = [];
    // }

    // await cart.save();

    for (let i = 0; i < cart.cartItems.length; i++) {
      const prod = await this.productsService.findOneForCart(
        cart.cartItems[i].productId._id.toString(),
      );
      if (
        prod === null ||
        cart.cartItems[i].quantity > prod.stock ||
        prod.stock === 0
      ) {
        cart.cartItems = cart.cartItems.filter(
          (item) => item !== cart.cartItems[i],
        );
        if (cart.cartItems.length === 0) {
          cart.coupons = [];
        }
        await cart.save();
      }
    }

    const { totalPrice, totalPriceAfterDiscount, coupons } =
      await this.calculateCartTotals(userId);

    cart.totalPrice = totalPrice;
    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    const cartCoupons = coupons.map((c) => c._id);
    cart.coupons = cartCoupons;
    await cart.save();

    await cart.save();

    return cart;
  }

  async removeProductFromCart(
    userId: string,
    removeProductFromCartDto: RemoveProductFromCartDto,
  ) {
    const product = await this.productsService.findOne(
      removeProductFromCartDto.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundException('cart not found');
    } else {
      // لو فيه كارت بالفعل
      const productExit = cart.cartItems.find(
        (item) =>
          item.productId.toString() ===
          removeProductFromCartDto.productId.toString(),
      );

      if (productExit) {
        cart = await this.cartModel.findOneAndUpdate(
          { user: userId },
          {
            $pull: {
              cartItems: {
                productId: new Types.ObjectId(
                  removeProductFromCartDto.productId,
                ),
              },
            },
          },
          { new: true },
        );
        if (!cart) {
          throw new NotFoundException('cart not found');
        }
      } else {
        throw new NotFoundException('product not found in cart');
      }
    }

    cart = await this.getCurrentUserCart(userId);
    return cart.populate('cartItems.productId');
  }

  private async calculateCartTotals(userId: string) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.productId');
    console.log('cart', cart);

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    let cartClone = cart.cartItems;
    cart.totalPrice = cartClone.reduce(
      (sum, item) => sum + (item.finalPrice ?? 0) * item.quantity,
      0,
    );

    const couponsIds = cart.coupons.map((coupon) => coupon.toString());

    const coupons = await this.couponService.findSomeCouponsIds(couponsIds);

    const couponsDisccount = coupons.reduce(
      (sum, item) => sum + item.discount,
      0,
    );
    if (couponsDisccount >= cart.totalPrice) {
      cart.totalPriceAfterDiscount = cart.totalPrice;
    } else {
      cart.totalPriceAfterDiscount = cart.totalPrice - couponsDisccount;
    }

    return {
      totalPrice: cart.totalPrice,
      totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
      coupons,
    };
  }

  // async getOrderCart (userId : string){
  //  const cart = await this.cartModel
  //     .findOne({ user: userId })
  //     .populate('cartItems.productId')
  //     .populate('coupons');
  //   if (!cart) {
  //       throw new NotFoundException('cart not found');
  //     }
  //     const cartItemsClone = cart.cartItems.filter(p => p.productId._id !== null ||  p.productId._id !== undefined  );
  //     cart.cartItems = cartItemsClone;
  //     await cart.save();
  //     return cart;
  // }

  async getOrderCart(userId: string) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.productId')
      .populate('coupons');

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    // فلترة cartItems وإزالة أي productId اتحذف
    const validCartItems = cart.cartItems.filter(
      (item) => item.productId && item.productId._id,
    );

    cart.cartItems = validCartItems;

    // لو كل المنتجات اتحذفت → cartItems فاضي
    if (validCartItems.length === 0) {
      cart.cartItems = [];
    }

    await cart.save();

    return cart;
  }
}
