import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ProductsService } from 'src/products/products.service';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './entities/cart.schema';
import { Model, Types } from 'mongoose';
import { CouponService } from 'src/coupon/coupon.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly productsService: ProductsService,
    private readonly couponService: CouponService,
  ) {}

  // async addProductToCart(userId : string ,createCartDto: CreateCartDto) {
  //   // تأكد إن المنتج موجود
  //   const product = await this.productsService.findOne(createCartDto.productId);

  //   // هات الكارت الخاص باليوزر
  //   let cart = await this.cartModel.findOne({ user: userId });

  //   // لو مفيش كارت، نعمل كارت جديد
  //   if (!cart) {
  //     cart = new this.cartModel({
  //       user: userId,
  //       cartItems: [
  //         {
  //           productId: product._id,
  //           quantity : createCartDto.quantity || 1,
  //         },
  //       ],
  //       totalPrice: product.price * createCartDto.quantity || 1,
  //     });
  //   } else {
  //     // لو فيه كارت
  //     const itemIndex = cart.cartItems.findIndex(
  //       (item) => item.productId.toString() === createCartDto.productId.toString(),
  //     );

  //     if (itemIndex > -1) {
  //       // لو المنتج موجود نزود الكمية
  //       cart.cartItems[itemIndex].quantity += createCartDto.quantity || 1;
  //     } else {
  //       // لو مش موجود ضيفه
  //       cart.cartItems.push({
  //         productId: product._id,
  //         quantity : createCartDto.quantity,
  //       });
  //     }

  //     // احسب التوتال من جديد
  //     cart.totalPrice = cart.cartItems.reduce((acc, item: any) => {
  //       const prod = item.productId.price ?? product.price; // fallback in case populated not done yet
  //       return acc + prod * item.quantity;
  //     }, 0);
  //   }

  //   await cart.save();
  //   return cart.populate('cartItems.productId'); // نرجع الكارت بالمنتجات
  // }

  async addProductToCart(
    userId: string,
    createCartDto: CreateCartDto,
  ){
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
            quantity : createCartDto.quantity || 1,
            price: product.price,
            finalPrice: product.finalPrice ,
          },
        ],
      });
    } else {
      // لو فيه كارت بالفعل
      const itemIndex = cart.cartItems.findIndex(
        (item) => item.productId.toString() === createCartDto.productId.toString(),
      );
console.log("itemIndex" , itemIndex);

      if (itemIndex > -1) {
        // المنتج موجود → نزود الكمية
        cart.cartItems[itemIndex].quantity += createCartDto.quantity || 1;
      } else {
        // المنتج مش موجود → ضيفه
        cart.cartItems.push({
          productId: product._id,
          quantity : createCartDto.quantity || 1,
          price: product.price,
          finalPrice: product.finalPrice,
        });
      }
    }

    // // 🧮 إعادة حساب الإجمالي
    // cart.totalPrice = cart.cartItems.reduce(
    //   (sum, item) => sum + (item.finalPrice ?? 0) * item.quantity,
    //   0,
    // );
  
    const {totalPrice , totalPriceAfterDiscount} = await this.calculateCartTotals(cart);

console.log("totalPrice" , totalPrice);
console.log("totalPriceAfterDiscount" , totalPriceAfterDiscount);

      cart.totalPrice = totalPrice;
      cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    await cart.save();
    return   cart.populate('cartItems.productId');
  }

  async changeCartproductQuantity(userId: string,createCartDto: CreateCartDto,){
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
        (item) => item.productId.toString() === createCartDto.productId.toString(),
      );
console.log("itemIndex" , itemIndex);

      if (itemIndex > -1) {
        // المنتج موجود → نزود الكمية
        cart.cartItems[itemIndex].quantity = createCartDto.quantity ;
      } else {
    throw new NotFoundException('product not found in cart');
      }
    }

    // // 🧮 إعادة حساب الإجمالي
    // cart.totalPrice = cart.cartItems.reduce(
    //   (sum, item) => sum + (item.finalPrice ?? 0) * item.quantity,
    //   0,
    // );
  
    const {totalPrice , totalPriceAfterDiscount} = await this.calculateCartTotals(cart);

console.log("totalPrice" , totalPrice);
console.log("totalPriceAfterDiscount" , totalPriceAfterDiscount);

      cart.totalPrice = totalPrice;
      cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    await cart.save();
    return   cart.populate('cartItems.productId');
  }

  async  getCurrentUserCart 
    (userId: string) {
        const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
  throw new NotFoundException('cart not found');
    }

    return cart;
  }

// async addProductToCart(userId: string, createCartDto: CreateCartDto) {
//   // Validate product
//   const product = await this.productsService.findOne(createCartDto.productId);
//   if (!product) {
//     throw new NotFoundException('Product not found');
//   }

//   // Convert userId to ObjectId
//   const userObjectId = new Types.ObjectId(userId);

//   // Define the cart item to add or update
//   const cartItem = {
//     productId: product._id,
//     quantity: createCartDto.quantity || 1,
//     price: product.price,
//     finalPrice: product.finalPrice,
//   };

//   // Atomically find or create the cart
//   const update = {
//     $setOnInsert: {
//       user: userObjectId,
//       cartItems: [cartItem],
//       coupons: [], // Initialize coupons if creating a new cart
//     },
//     $addToSet: {}, // Initialize to avoid empty update
//   };

//   // Check if the product already exists in the cart
//   const existingCart = await this.cartModel.findOne({ user: userObjectId });
//   if (existingCart) {
//     const itemIndex = existingCart.cartItems.findIndex(
//       (item) => item.productId.toString() === createCartDto.productId.toString(),
//     );

//     if (itemIndex > -1) {
//       // Product exists, update quantity
//       update.$inc = {
//         [`cartItems.${itemIndex}.quantity`]: createCartDto.quantity || 1,
//       };
//     } else {
//       // Product doesn't exist, add it
//       update.$push = { cartItems: cartItem };
//     }
//   } else {
//     // No cart exists, $setOnInsert will handle creation
//     update.$setOnInsert.cartItems = [cartItem];
//   }

//   // Perform atomic update
//   const cart = await this.cartModel.findOneAndUpdate(
//     { user: userObjectId },
//     update,
//     {
//       new: true, // Return the updated document
//       upsert: true, // Create a new document if none exists
//     },
//   );

//   // Calculate totals
//   const { totalPrice, totalPriceAfterDiscount } = await this.calculateCartTotals(cart);

//   // Update totals
//   cart.totalPrice = totalPrice;
//   cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

//   // Save the updated cart
//   await cart.save();

//   // Populate cart items
//   return cart.populate('cartItems.productId');
// }

  // 🟠 جلب الكارت ليوزر
  // async getUserCart(userId: string): Promise<Cart> {
  //   const cart = await this.cartModel
  //     .findOne({ user: userId })
  //     .populate('cartItems.productId');
  //   if (!cart) throw new NotFoundException('Cart not found');
  //   return cart;
  // }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }

  private async calculateCartTotals(cart: Cart) {
    cart.totalPrice = cart.cartItems.reduce(
      (sum, item) => sum + (item.finalPrice ?? 0) * item.quantity,
      0,
    );

    const couponsIds =  cart.coupons.map(coupon => coupon.couponId.toString());

    const coupons = await this.couponService.findSomeCouponsIds(couponsIds)

    const couponsDisccount = coupons.reduce((sum ,item)=> sum + item.discount,0)
if (couponsDisccount >= cart.totalPrice) {
  cart.totalPriceAfterDiscount = cart.totalPrice
} else {
  cart.totalPriceAfterDiscount = cart.totalPrice - couponsDisccount;
}
  return {totalPrice : cart.totalPrice , totalPriceAfterDiscount : cart.totalPriceAfterDiscount}
  }
}
