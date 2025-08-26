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
  UploadedFile,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Roles } from 'src/auth/decorator/Roles.decorator';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('api/v1/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannerService.create(createBannerDto, file);
  }

  @Get()
  findAll() {
    return this.bannerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(id);
  }

  @Patch(':id')
  @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id' ,ParseObjectIdPipe) id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannerService.update(id, updateBannerDto,file);
  }

  @Delete(':id')
    @Roles([UserRoles.ADMIN])
  @UseGuards(AuthGuard)
  remove(@Param('id',ParseObjectIdPipe) id: string) {
    return this.bannerService.remove(id);
  }
}
