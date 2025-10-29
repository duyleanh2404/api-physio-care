import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiCreateDoctor,
  ApiUpdateDoctor,
  ApiDeleteDoctor,
  ApiFindOneDoctor,
  ApiFindAllDoctors,
  ApiFindOneDoctorBySlug,
  ApiFindOneDoctorByClinicSlug,
} from 'src/docs/swagger/doctor.swagger';
import { DoctorService } from './doctor.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiCreateDoctor()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() dto: CreateDoctorDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.doctorService.create(dto, avatar);
  }

  @Get()
  @ApiFindAllDoctors()
  async findAll(@Query() query: GetDoctorsQueryDto) {
    return this.doctorService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiFindOneDoctorBySlug()
  async findBySlug(@Param('slug') slug: string) {
    return this.doctorService.findBySlug(slug);
  }

  @Get('clinic/:clinicSlug/:slug')
  @ApiFindOneDoctorByClinicSlug()
  async findByClinicAndSlug(
    @Param('clinicSlug') clinicSlug: string,
    @Param('slug') slug: string,
  ) {
    return this.doctorService.findByClinicAndSlug(clinicSlug, slug);
  }

  @Get(':id')
  @ApiFindOneDoctor()
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiUpdateDoctor()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.doctorService.update(id, dto, avatar);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiDeleteDoctor()
  async remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }
}
