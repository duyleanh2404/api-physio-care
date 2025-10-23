import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserProvider, UserRole, UserStatus } from 'src/enums/user.enums';

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
  fullName?: string;

  @ApiPropertyOptional({
    example: UserRole.USER,
    enum: UserRole,
    description: 'Role of the user',
  })
  role?: UserRole;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: "URL to the user's avatar image",
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: UserProvider.LOCAL,
    enum: UserProvider,
    description: 'Authentication provider (e.g., google, local)',
  })
  provider?: UserProvider;

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'Status of the user account (e.g., active, inactive)',
  })
  status?: UserStatus;

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
