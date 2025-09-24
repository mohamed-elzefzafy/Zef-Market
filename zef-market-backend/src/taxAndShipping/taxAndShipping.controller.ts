import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { TaxAndShippingService } from './taxAndShipping.service';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateTaxAndShippingDto } from './dto/update-taxAndShipping.dto';

@Controller('api/v1/tax-and-shipping')
export class TaxAndShippingController {
  constructor(private readonly taxAndShippingService: TaxAndShippingService) {}

  @Get()
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  findAll() {
    return this.taxAndShippingService.findAll();
  }

  @Patch()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Body() updateTaxAndShippingDto: UpdateTaxAndShippingDto) {
    return this.taxAndShippingService.update(updateTaxAndShippingDto);
  }
}
