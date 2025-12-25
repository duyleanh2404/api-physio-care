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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  ApiCreateAppointment,
  ApiUpdateAppointment,
  ApiDeleteAppointment,
  ApiFindOneAppointment,
  ApiFindMyAppointments,
  ApiFindAllAppointments,
  ApiFindAppointmentByCode,
  ApiFindDoctorAppointments,
  ApiFindAppointmentByScheduleId,
} from 'src/docs/swagger/appointment.swagger';
import { AppointmentService } from './appointments.service';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { GetDoctorAppointmentsQueryDto } from './dto/get-doctor-appointments-query.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles('user', 'admin')
  @ApiCreateAppointment()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateAppointmentDto, @Request() request) {
    return this.appointmentService.create(dto, request);
  }

  @Get()
  @Roles('admin')
  @ApiFindAllAppointments()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Query() query: GetAppointmentsQueryDto, @Request() request) {
    return this.appointmentService.findAll(query, request);
  }

  @Get('me')
  @Roles('user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindMyAppointments()
  async findMyAppointments(
    @Query() query: GetAppointmentsQueryDto,
    @Request() request,
  ) {
    const userId = request.user?.sub;
    return this.appointmentService.findAll({ ...query, userId }, request);
  }

  @Get('my-doctors')
  @Roles('clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindDoctorAppointments()
  async findClinicDoctorsAppointments(
    @Query() query: GetDoctorAppointmentsQueryDto,
    @Request() request,
  ) {
    const userId = request.user.sub;
    return this.appointmentService.findClinicDoctorsAppointments(
      userId,
      query,
      request,
    );
  }

  @Get('my-schedules')
  @Roles('doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindDoctorAppointments()
  async findDoctorAppointments(
    @Query() query: GetDoctorAppointmentsQueryDto,
    @Request() request,
  ) {
    const userId = request.user.sub;
    return this.appointmentService.findDoctorAppointments(
      userId,
      query,
      request,
    );
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  @ApiFindAppointmentByCode()
  findByCode(@Param('code') code: string, @Request() request) {
    return this.appointmentService.findByCode(code, request);
  }

  @Get(':id')
  @Roles('user', 'admin')
  @ApiFindOneAppointment()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string, @Request() request) {
    return this.appointmentService.findOne(id, request);
  }

  @Get('schedule/:scheduleId')
  @Roles('admin', 'doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindAppointmentByScheduleId()
  async findByScheduleId(
    @Param('scheduleId') scheduleId: string,
    @Request() request,
  ) {
    return this.appointmentService.findByScheduleId(scheduleId, request);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiUpdateAppointment()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentService.update(id, dto, req);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'doctor')
  @ApiDeleteAppointment()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Request() request) {
    return this.appointmentService.remove(id, request);
  }
}
