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
  ApiCreateSchedule,
  ApiDeleteSchedule,
  ApiFindMySchedules,
  ApiFindOneSchedule,
  ApiFindAllSchedules,
  ApiGetSchedulesInRange,
  ApiFindSchedulesByClinic,
  ApiGetSchedulesByDoctorAndDate,
} from 'src/docs/swagger/schedule.swagger';
import { ScheduleService } from './schedule.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { GetSchedulesQueryDto } from './dto/get-schedules-query.dto';
import { GetSchedulesRangeDto } from './dto/get-schedules-range.dto';
import { GetScheduleByDoctorDateDto } from './dto/get-schedules-by-doctor-date.dto';

@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'doctor', 'clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreateSchedule()
  async create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindAllSchedules()
  async findAll(@Query() query: GetSchedulesQueryDto) {
    return this.scheduleService.findAll(query);
  }

  @Get('by-date')
  @ApiBearerAuth()
  @Roles('admin', 'clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiGetSchedulesByDoctorAndDate()
  async getByDoctorAndDate(
    @Query() query: GetScheduleByDoctorDateDto,
    @Request() req
  ) {
    return this.scheduleService.findByDoctorAndDate(query, req.user);
  }

  @Get('me')
  @ApiBearerAuth()
  @Roles('doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindMySchedules()
  async findMySchedules(@Request() req, @Query() query: GetSchedulesQueryDto) {
    const userId = req.user.sub;
    return this.scheduleService.findMySchedules(userId, query);
  }

  @Get('my-doctors')
  @ApiBearerAuth()
  @Roles('clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiFindSchedulesByClinic()
  async findMyDoctorsSchedules(
    @Request() req,
    @Query() query: GetSchedulesQueryDto,
  ) {
    const userId = req.user.sub;
    return this.scheduleService.findSchedulesByClinic(userId, query);
  }

  @Get('range')
  @ApiGetSchedulesInRange()
  async findByDateRange(@Query() query: GetSchedulesRangeDto) {
    return this.scheduleService.findByDateRange(query);
  }

  @Get(':id')
  @ApiFindOneSchedule()
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'doctor', 'clinic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiDeleteSchedule()
  async remove(@Param('id') id: string, @Request() req) {
    return this.scheduleService.remove(id, req.user.sub, req.user.role);
  }
}
