import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'acee4e04-3925-4505-83d6-7a2e0b614f7e',
    description: 'User ID (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  fullName: string;

  @ApiPropertyOptional({
    example: 'user',
    description: 'Role of the user',
  })
  role?: string;

  @ApiProperty({
    example: '2025-09-23T12:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-23T12:10:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
