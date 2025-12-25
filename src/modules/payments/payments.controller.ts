import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';

import {
  ApiFindMyPayments,
  ApiFindAllPayments,
} from 'src/docs/swagger/payment.swagger';
import { PaymentsService } from './payments.service';
import { Roles } from 'src/core/auth/decorators/roles.decorator';

import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';

import { GetPaymentsQueryDto } from './dto/get-payments-query.dto';
import { GetMyPaymentsQueryDto } from './dto/get-my-payments-query.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiFindAllPayments()
  @Roles('admin', 'clinic', 'doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Query() query: GetPaymentsQueryDto, @Request() req) {
    return this.paymentsService.findAll(query, req.user, req);
  }

  @Get('me')
  @Roles('user')
  @ApiFindMyPayments()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findMyPayments(@Query() query: GetMyPaymentsQueryDto, @Request() req) {
    return this.paymentsService.findMyPayments(query, req.user.sub);
  }
}
