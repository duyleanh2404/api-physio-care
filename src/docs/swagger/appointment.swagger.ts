import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AppointmentResponseDto } from 'src/modules/appointments/dto/appointment-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { CreateAppointmentDto } from 'src/modules/appointments/dto/create-appointment.dto';
import { UpdateAppointmentDto } from 'src/modules/appointments/dto/update-appointment.dto';

export const ApiFindAllAppointments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all appointments',
      description: 'Retrieve a list of all appointments',
    }),
    ApiResponse({
      status: 200,
      description: 'List of appointments successfully retrieved',
      type: PaginatedResponseDto(AppointmentResponseDto),
    }),
  );

export const ApiFindOneAppointment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get appointment by ID',
      description: 'Retrieve details of a specific appointment',
    }),
    ApiParam({ name: 'id', description: 'Appointment ID' }),
    ApiResponse({
      status: 200,
      description: 'Appointment details retrieved successfully',
      type: AppointmentResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Appointment not found',
      schema: { example: { message: 'Appointment not found' } },
    }),
  );

export const ApiCreateAppointment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new appointment',
      description: 'User can create an appointment with a doctor',
    }),
    ApiBody({ type: CreateAppointmentDto }),
    ApiResponse({
      status: 201,
      description: 'Appointment created successfully',
      type: AppointmentResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Permission denied',
      schema: { example: { message: 'Permission denied' } },
    }),
  );

export const ApiUpdateAppointment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update appointment',
      description: 'Update details of an appointment',
    }),
    ApiParam({ name: 'id', description: 'Appointment ID' }),
    ApiBody({ type: UpdateAppointmentDto }),
    ApiResponse({
      status: 200,
      description: 'Appointment updated successfully',
      type: AppointmentResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Appointment not found',
      schema: { example: { message: 'Appointment not found' } },
    }),
  );

export const ApiDeleteAppointment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete appointment',
      description: 'Remove an appointment from the system',
    }),
    ApiParam({ name: 'id', description: 'Appointment ID' }),
    ApiResponse({
      status: 200,
      description: 'Appointment deleted successfully',
      schema: { example: { message: 'Appointment deleted successfully' } },
    }),
    ApiResponse({
      status: 404,
      description: 'Appointment not found',
      schema: { example: { message: 'Appointment not found' } },
    }),
  );
