import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { SpecialtyResponseDto } from 'src/modules/specialties/dto/specialty-response.dto';

export class DoctorResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the doctor',
    example: 'e7c9f292-5cf1-4c7b-9f8a-bad0b04db129',
  })
  id: string;

  @ApiProperty({
    description: 'Associated user object',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Doctor’s specialty information',
    type: () => SpecialtyResponseDto,
  })
  specialty: SpecialtyResponseDto;

  @ApiProperty({
    description: 'Doctor’s medical license number',
    example: 'HCM-123456',
    nullable: true,
  })
  licenseNumber?: string;

  @ApiProperty({
    description: 'Years of professional experience',
    example: 7,
    nullable: true,
  })
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Short biography or professional summary',
    example: 'Experienced orthopedic surgeon with a focus on sports injuries.',
    nullable: true,
  })
  bio?: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-10-13T14:22:05.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-10-13T18:45:22.000Z',
  })
  updatedAt: Date;
}
