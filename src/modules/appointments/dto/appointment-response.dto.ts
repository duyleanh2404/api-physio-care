import { ApiProperty } from '@nestjs/swagger';

import { AppointmentStatus } from 'src/enums/appointments-status.enum';

import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { DoctorResponseDto } from 'src/modules/doctors/dto/doctor-response.dto';

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'c87e8a1d-5b91-4e21-92b3-3b024f1a7a4d',
  })
  id: string;

  @ApiProperty({
    description: 'Doctor information',
    type: DoctorResponseDto,
    example: {
      id: 'a15b7e42-0a6b-47a1-9d4f-1c1b88e4d6e9',
      slug: 'nguyen-van-a',
      fullName: 'Nguyen Van A',
      licenseNumber: 'LD123456',
      yearsOfExperience: 10,
      bio: 'Experienced cardiologist with 10 years of practice.',
      avatar: 'https://example.com/avatar-doctor.jpg',
      specialty: {
        id: 's01',
        name: 'Cardiology',
      },
      clinic: {
        id: 'c01',
        name: 'City Hospital',
        address: '123 Main Street, Hanoi, Vietnam',
        phone: '0123456789',
        avatar: 'https://example.com/clinic-avatar.jpg',
        banner: 'https://example.com/clinic-banner.jpg',
        description: 'Leading hospital in Hanoi.',
        provinceId: 'HN',
        districtId: 'D1',
        wardId: 'W1',
      },
      createdAt: '2025-01-01T08:00:00Z',
      updatedAt: '2025-01-01T08:00:00Z',
    },
  })
  doctor: DoctorResponseDto;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
    example: {
      id: 'b57e8b1c-5b91-4e21-92b3-3b024f1a7a4d',
      email: 'nguyenvana@example.com',
      fullName: 'Nguyen Van A',
      avatarUrl: 'https://example.com/avatar-user.jpg',
      role: 'doctor',
      status: 'active',
      provider: 'local',
      createdAt: '2025-01-01T08:00:00Z',
      updatedAt: '2025-01-01T08:00:00Z',
    },
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Appointment date and time',
    example: '2025-11-01T10:00:00Z',
  })
  appointmentDate: string;

  @ApiProperty({
    description: 'Optional notes',
    required: false,
    example: 'Patient prefers morning schedule.',
  })
  notes?: string;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Created date', example: '2025-10-28T12:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: 'Updated date', example: '2025-10-28T12:00:00Z' })
  updatedAt: string;
}
