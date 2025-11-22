import {
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import {
  ApiCreateSpecialty,
  ApiDeleteSpecialty,
  ApiUpdateSpecialty,
  ApiFindOneSpecialty,
  ApiFindAllSpecialties,
  ApiFindOneSpecialtyBySlug,
} from 'src/docs/swagger/specialty.swagger';
import { SpecialtyService } from './specialty.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { GetSpecialtiesQueryDto } from './dto/get-specialties-query.dto';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiCreateSpecialty()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateSpecialtyDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.specialtyService.create(dto, image);
  }

  @Get()
  @ApiFindAllSpecialties()
  async findAll(@Query() query: GetSpecialtiesQueryDto) {
    return this.specialtyService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiFindOneSpecialtyBySlug()
  async findBySlug(@Param('slug') slug: string) {
    return this.specialtyService.findBySlug(slug);
  }

  @Get(':id')
  @ApiFindOneSpecialty()
  async findOne(@Param('id') id: string) {
    return this.specialtyService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiUpdateSpecialty()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.specialtyService.update(id, dto, image);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiDeleteSpecialty()
  async remove(@Param('id') id: string) {
    return this.specialtyService.remove(id);
  }
}
