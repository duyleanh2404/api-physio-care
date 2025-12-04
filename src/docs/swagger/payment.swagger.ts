import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaymentResponseDto } from 'src/modules/payments/dto/payment-response.dto';

export const ApiFindAllPayments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all payments',
      description: 'Retrieve a list of all payments',
    }),
    ApiResponse({
      status: 200,
      description: 'List of payments successfully retrieved',
      type: PaginatedResponseDto(PaymentResponseDto),
    }),
  );

export const ApiFindMyPayments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get my payments',
      description: 'Retrieve a list of payments for the logged-in user',
    }),
    ApiResponse({
      status: 200,
      description:
        'List of payments for the current user successfully retrieved',
      type: PaginatedResponseDto(PaymentResponseDto),
    }),
  );
