import * as argon2 from 'argon2';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { getJwtConfig } from '../config/jwt.config';
import { UserService } from 'src/modules/user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenRepository {
  private readonly jwtConfig: ReturnType<typeof getJwtConfig>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig = getJwtConfig(this.configService);
  }

  async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessTokenSecret,
      expiresIn: this.jwtConfig.accessTokenExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshTokenSecret,
      expiresIn: this.jwtConfig.refreshTokenExpiresIn,
    });

    await this.setRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async setRefreshToken(userId: string, token: string) {
    const hashed = await argon2.hash(token);
    await this.userService.update(userId, { refreshToken: hashed });
  }

  async validateRefreshToken(userId: string, token: string) {
    const user = await this.userService.findByIdWithRefreshToken(userId);
    if (!user || !user.refreshToken) return false;
    return await argon2.verify(user.refreshToken, token);
  }

  async removeRefreshToken(userId: string) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
    findUser: (id: string) => Promise<any>,
  ) {
    const valid = await this.validateRefreshToken(userId, refreshToken);
    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await findUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.removeRefreshToken(userId);

    return this.generateTokens(user);
  }

  decodeRefreshToken(token: string) {
    return this.jwtService.decode(token) as any;
  }
}
