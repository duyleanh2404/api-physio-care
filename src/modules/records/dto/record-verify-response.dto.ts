import { ApiProperty } from '@nestjs/swagger';

export class RecordVerifyResponseDto {
  @ApiProperty({
    example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    description: 'ID of the verified record',
  })
  recordId: string;

  @ApiProperty({
    example: 'lab-results.pdf',
    description: 'Original filename of the verified file',
  })
  fileName: string;

  @ApiProperty({
    example: true,
    description:
      'Indicates whether the uploaded file matches the stored signature',
  })
  verified: boolean;

  @ApiProperty({
    example: 'File is authentic and matches the stored signature',
    description: 'Detailed verification message',
  })
  message: string;
}
