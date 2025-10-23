import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';

export class AuthLoginResponse {
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  refreshToken: string;
}
