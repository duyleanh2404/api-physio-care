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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  ApiCreateAppointment,
  ApiUpdateAppointment,
  ApiDeleteAppointment,
  ApiFindOneAppointment,
  ApiFindAllAppointments,
} from 'src/docs/swagger/appointment.swagger';
import { AppointmentService } from './appointments.service';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('user', 'admin')
  @ApiCreateAppointment()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiFindAllAppointments()
  async findAll(@Query() query: GetAppointmentsQueryDto) {
    return this.appointmentService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('user', 'admin')
  @ApiFindOneAppointment()
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('user', 'admin')
  @ApiUpdateAppointment()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiDeleteAppointment()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
