import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';;
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { PAGE_LIMIT_ADMIN } from 'src/shared/constants';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types';
import { SubCategoryService } from './subcategory.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@Controller('api/v1/subcategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subCategoryService.create(createSubCategoryDto, file);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = `${PAGE_LIMIT_ADMIN}`,
      @Query('category') category: string = '',
  ) {
    return this.subCategoryService.findAll(+page, +limit , category);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.subCategoryService.findOne(id);
  }

  @Patch(':id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subCategoryService.update(id, updateSubCategoryDto, file);
  }

  @Delete(':id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.subCategoryService.remove(id);
  }

  // @Get('getCategoriesCount')
  // @Roles([UserRoles.ADMIN])
  // getPostsCount() {
  //   return this.categoryService.getCategoriesCount();
  // }
}
