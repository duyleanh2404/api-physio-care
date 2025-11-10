import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Request,
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
  ApiFindMeDoctor,
  ApiFindOneDoctor,
  ApiFindAllDoctors,
  ApiFindMyPatients,
  ApiFindOneDoctorBySlug,
  ApiFindOneDoctorByClinicSlug,
} from 'src/docs/swagger/doctor.swagger';
import { DoctorService } from './doctor.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';
import { GetMyPatientsQueryDto } from './dto/get-my-patients-query.dto';
import { GetDoctorsByClinicQueryDto } from './dto/get-doctors-by-clinic.dto';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'clinic')
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('doctor')
  @Get('my-patients')
  @ApiFindMyPatients()
  async findMyPatients(@Query() query: GetMyPatientsQueryDto, @Request() req) {
    const userId = req.user?.sub;
    return this.doctorService.findMyPatients(userId, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('clinic')
  @Get('my-doctors')
  @ApiFindAllDoctors()
  async findDoctorsByMyClinic(
    @Query() query: GetDoctorsByClinicQueryDto,
    @Request() req,
  ) {
    const userId = req.user?.sub;
    return this.doctorService.findDoctorsByClinicUser(userId, query);
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

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindMeDoctor()
  async findMe(@Request() req) {
    const user = req.user as { sub: string };
    return this.doctorService.findMe(user.sub);
  }

  @Get(':id')
  @ApiFindOneDoctor()
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin', 'clinic')
  @ApiUpdateDoctor()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.doctorService.update(id, dto, avatar, userId, role);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'clinic')
  @ApiDeleteDoctor()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.doctorService.remove(id, userId, role);
  }
}
