import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (config: ConfigService) => ({
  accessTokenSecret: config.get<string>('JWT_ACCESS_SECRET'),
  refreshTokenSecret: config.get<string>('JWT_REFRESH_SECRET'),
  accessTokenExpiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN'),
  refreshTokenExpiresIn: config.get<string>('JWT_REFRESH_EXPIRES_IN'),
});
