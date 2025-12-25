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
  @ApiCreateDoctor()
  @Roles('admin', 'clinic')
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
  @Get('my-patients')
  @ApiFindMyPatients()
  @Roles('doctor', 'clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findMyPatients(@Query() query: GetMyPatientsQueryDto, @Request() req) {
    const userId = req.user?.sub;
    const role = req.user?.role;

    return this.doctorService.findMyPatients(userId, role, query, req);
  }

  @ApiBearerAuth()
  @Roles('clinic')
  @Get('my-doctors')
  @ApiFindAllDoctors()
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get('me')
  @Roles('doctor')
  @ApiBearerAuth()
  @ApiFindMeDoctor()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiUpdateDoctor()
  @Roles('admin', 'clinic')
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
  @ApiDeleteDoctor()
  @Roles('admin', 'clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.doctorService.remove(id, userId, role);
  }
}
