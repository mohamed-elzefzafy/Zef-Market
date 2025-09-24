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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { PAGE_LIMIT_ADMIN } from 'src/shared/constants';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('api/v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create-order')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const userId = user.id;
    return this.orderService.createOrder(createOrderDto, userId);
  }
  // @Get("get-admin-all-orders")
  //   @Roles([UserRoles.ADMIN])
  // @UseGuards(AuthGuard)
  // getAdminAllOrders() {
  //   return this.orderService.getAdminAllOrders();
  // }

  @Get('get-admin-all-orders')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  getAdminAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = `${PAGE_LIMIT_ADMIN}`,
  ) {
    return this.orderService.getAdminAllOrders(+page, +limit);
  }

  @Get('get-current-user-all-orders')
  @Roles([UserRoles.USER])
  @UseGuards(AuthGuard)
  getCurrentUserAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = `${PAGE_LIMIT_ADMIN}`,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.orderService.getCurrentUserAllOrders(+page, +limit, user.id);
  }

  @Get(':id')
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  @UseGuards(AuthGuard)
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.orderService.findOne(id, user);
  }

  @Patch('admin-update-order-to-paid/:id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  toggleOrderToPaidStatue(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.toggleOrderToPaidStatue(id);
  }

  @Patch('admin-update-order-to-deliver/:id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  toggleOrderToDeliverdStatue(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orderService.toggleOrderToDeliverdStatue(id);
  }

  // orders.controller.ts
  @Post('paypal/capture/:orderId/:paypalOrderId')
  @UseGuards(AuthGuard)
  async capturePaypal(
    @Param('orderId') orderId: string,
    @Param('paypalOrderId') paypalOrderId: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.orderService.capturePaypalOrder(
      orderId,
      paypalOrderId,
      user.id,
    );
  }
}
