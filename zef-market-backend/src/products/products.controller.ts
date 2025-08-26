import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { multerOptions } from 'src/shared/multer.config';
import { PAGE_LIMIT_ADMIN } from 'src/shared/constants';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3, multerOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.create(createProductDto, files);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = `${PAGE_LIMIT_ADMIN}`,
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
    @Query('brand') brand?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(
      +page,
      +limit,
      category,
      subCategory,
      brand,
      search,
    );
  }
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
    @UseInterceptors(FilesInterceptor('images', 3, multerOptions))
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.update(id, updateProductDto, files);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.remove(id);
  }
}
