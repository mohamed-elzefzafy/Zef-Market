import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { TaxAndShippingService } from './taxAndShipping.service';
import { CreateTaxAndShippingDto } from './dto/create-taxAndShipping.dto';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';


@Controller('api/v1/tax-and-shipping')
export class TaxAndShippingController {
  constructor(private readonly taxAndShippingService: TaxAndShippingService) {}

  @Post()
    @Roles([UserRoles.ADMIN])
    @UseGuards(AuthGuard)
  create(@Body() createTaxAndShippingDto: CreateTaxAndShippingDto) {
    return this.taxAndShippingService.create(createTaxAndShippingDto);
  }

  @Get()
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  findAll() {
    return this.taxAndShippingService.findAll();
  }

  @Delete()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove() {
    return this.taxAndShippingService.remove();
  }
}
