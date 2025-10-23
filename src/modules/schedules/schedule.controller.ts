import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Controller,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  ApiCreateSchedule,
  ApiUpdateSchedule,
  ApiFindAllSchedules,
  ApiFindOneSchedule,
  ApiDeleteSchedule,
} from 'src/docs/swagger/schedule.swagger';
import { ScheduleService } from './schedule.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GetSchedulesQueryDto } from './dto/get-schedules-query.dto';

@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'doctor')
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

  @Get(':id')
  @ApiFindOneSchedule()
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin', 'doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUpdateSchedule()
  async update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiDeleteSchedule()
  async remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
