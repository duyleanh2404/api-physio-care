import { ApiProperty } from '@nestjs/swagger';

import { PaymentStatus } from 'src/enums/payments-status.enum';

import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AppointmentResponseDto } from '../../appointments/dto/appointment-response.dto';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID', type: String })
  id: string;

  @ApiProperty({ description: 'Transaction ID', type: String })
  transactionId: string;

  @ApiProperty({ description: 'Amount paid', type: Number })
  amount: number;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Associated user', type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Associated appointment',
    type: () => AppointmentResponseDto,
  })
  appointment: AppointmentResponseDto;

  @ApiProperty({
    description: 'Raw payment description',
    type: String,
    nullable: true,
  })
  rawDescription?: string;

  @ApiProperty({ description: 'Payment created at', type: Date })
  createdAt: Date;
}
