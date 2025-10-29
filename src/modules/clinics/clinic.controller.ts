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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { GetClinicsQueryDto } from './dto/get-clinics-query.dto';

import {
  ApiCreateClinic,
  ApiUpdateClinic,
  ApiDeleteClinic,
  ApiFindOneClinic,
  ApiFindAllClinics,
  ApiFindOneClinicBySlug,
} from 'src/docs/swagger/clinic.swagger';
import { ClinicService } from './clinic.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

@ApiTags('Clinics')
@Controller('clinics')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiCreateClinic()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  create(
    @Body() dto: CreateClinicDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    return this.clinicService.create(dto, files);
  }

  @Get()
  @ApiFindAllClinics()
  async findAll(@Query() query: GetClinicsQueryDto) {
    return this.clinicService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiFindOneClinicBySlug()
  async findBySlug(@Param('slug') slug: string) {
    return this.clinicService.findBySlug(slug);
  }

  @Get(':id')
  @ApiFindOneClinic()
  findOne(@Param('id') id: string) {
    return this.clinicService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiUpdateClinic()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    return this.clinicService.update(id, dto, files);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiDeleteClinic()
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.clinicService.remove(id);
  }
}
