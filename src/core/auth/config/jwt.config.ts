import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
}));
