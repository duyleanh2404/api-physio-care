import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiOperation } from '@nestjs/swagger';

import {
  ScheduleResponseDto,
  ScheduleRangeResponseDto,
} from 'src/modules/schedules/dto/schedule-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { CreateScheduleDto } from 'src/modules/schedules/dto/create-schedule.dto';
import { UpdateScheduleDto } from 'src/modules/schedules/dto/update-schedule.dto';

export const ApiFindAllSchedules = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all schedules',
      description:
        'Retrieve a paginated list of doctor schedules with optional filters and sorting.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of schedules retrieved successfully',
      type: PaginatedResponseDto(ScheduleResponseDto),
    }),
  );

export const ApiFindMySchedules = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get schedules of the currently authenticated doctor',
      description:
        'Retrieve a paginated list of schedules that belong to the logged-in doctor (based on the doctor’s user account). Supports filtering, date range, and sorting options.',
    }),
    ApiResponse({
      status: 200,
      description: 'Doctor schedules retrieved successfully',
      type: PaginatedResponseDto(ScheduleResponseDto),
    }),
    ApiResponse({
      status: 400,
      description: 'Missing or invalid parameters',
      schema: { example: { message: 'Invalid parameters' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor profile not found for this user',
      schema: { example: { message: 'Doctor not found' } },
    }),
  );

export const ApiGetSchedulesInRange = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get schedules within a date range',
      description:
        'Retrieve a list of schedules for a specific doctor between the given start and end dates.',
    }),
    ApiResponse({
      status: 200,
      description:
        'Schedules within the specified range retrieved successfully',
      type: ScheduleRangeResponseDto,
      isArray: true,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid date range or parameters',
      schema: { example: { message: 'Invalid date range' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found',
      schema: { example: { message: 'Doctor not found' } },
    }),
  );

export const ApiFindOneSchedule = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get schedule by ID',
      description: 'Retrieve details of a specific doctor schedule by its ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'Schedule ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Schedule details retrieved successfully',
      type: ScheduleResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Schedule not found',
      schema: { example: { message: 'Schedule not found' } },
    }),
  );

export const ApiCreateSchedule = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new schedule (Admin/Doctor only)',
      description:
        'Allows an admin or doctor to create a new work schedule. Automatically checks for overlapping time slots for the same doctor.',
    }),
    ApiBody({ type: CreateScheduleDto }),
    ApiResponse({
      status: 201,
      description: 'Schedule created successfully',
      type: ScheduleResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
      schema: { example: { message: 'Validation failed' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Doctor not found',
      schema: { example: { message: 'Doctor not found' } },
    }),
    ApiResponse({
      status: 409,
      description: 'Schedule time conflict',
      schema: { example: { message: 'Schedule time conflict' } },
    }),
  );

export const ApiUpdateSchedule = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update a schedule (Admin/Doctor only)',
      description:
        'Update schedule details such as date, start/end time, status, or notes.',
    }),
    ApiParam({
      name: 'id',
      description: 'Schedule ID',
    }),
    ApiBody({ type: UpdateScheduleDto }),
    ApiResponse({
      status: 200,
      description: 'Schedule updated successfully',
      type: ScheduleResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Schedule not found',
      schema: { example: { message: 'Schedule not found' } },
    }),
  );

export const ApiDeleteSchedule = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete a schedule (Admin only)',
      description: 'Remove a schedule record from the system permanently.',
    }),
    ApiParam({
      name: 'id',
      description: 'Schedule ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Schedule deleted successfully',
      schema: { example: { message: 'Schedule deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Schedule not found',
      schema: { example: { message: 'Schedule not found' } },
    }),
  );
