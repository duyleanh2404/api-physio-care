import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordResponseDto {
  @ApiProperty({
    example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    description: 'Unique ID of the record',
  })
  id: string;

  @ApiProperty({
    example: 'REC-20251002-001',
    description: 'Unique code of the medical record',
  })
  recordCode: string;

  @ApiProperty({
    example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    description: 'ID of the patient this record belongs to',
  })
  patientsId: string;

  @ApiProperty({
    example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    description: 'ID of the doctor associated with this record',
  })
  doctorId: string;

  @ApiProperty({
    example: 'active',
    description: 'Status of the record',
    enum: ['active', 'completed', 'pending'],
  })
  status: string;

  @ApiPropertyOptional({
    example: 'Patient had mild headache for 3 days',
    description: 'History or notes of the record',
  })
  history?: string;

  @ApiPropertyOptional({
    example: 'Physiotherapy',
    description: 'Type of treatment',
  })
  treatmentType?: string;

  @ApiPropertyOptional({
    example: 'Moderate',
    description: 'Treatment intensity',
  })
  intensity?: string;

  @ApiPropertyOptional({
    example: '2 times/week',
    description: 'Treatment frequency',
  })
  frequency?: string;

  @ApiPropertyOptional({
    example: 'Improve mobility',
    description: 'Goals of the treatment',
  })
  goals?: string;

  @ApiPropertyOptional({
    example: '20% improvement after 2 weeks',
    description: 'Progress notes',
  })
  progress?: string;

  @ApiPropertyOptional({
    example: 'record_notes.pdf',
    description: 'Original name of the uploaded file',
  })
  attachmentName?: string;

  @ApiPropertyOptional({
    example: 'application/pdf',
    description: 'MIME type of the uploaded file',
  })
  attachmentMime?: string;

  @ApiProperty({
    example: '2025-10-02T12:00:00.000Z',
    description: 'Record creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-02T13:00:00.000Z',
    description: 'Record last update timestamp',
  })
  updatedAt: Date;
}
