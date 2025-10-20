import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService, ConfigType } from '@nestjs/config';

import jwtConfig from '../config/jwt.config';
import { AuthGateway } from '../auth.gateway';
import { UserToken } from '../entity/user-tokens.entity';
import { UserService } from 'src/modules/user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenRepository {
  private readonly jwtConfig: ConfigType<typeof jwtConfig>;

  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepo: Repository<UserToken>,

    private readonly authGateway: AuthGateway,

    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig =
      this.configService.get<ConfigType<typeof jwtConfig>>('jwt')!;
  }

  async generateTokens(user: any, deviceInfo?: string, ipAddress?: string) {
    const jti = randomUUID();

    const payload: JwtPayload = {
      jti,
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessTokenSecret,
      expiresIn: this.jwtConfig.accessTokenExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshTokenSecret,
      expiresIn: this.jwtConfig.refreshTokenExpiresIn,
    });

    await this.setRefreshToken(
      user.id,
      refreshToken,
      jti,
      deviceInfo,
      ipAddress,
    );

    return { accessToken, refreshToken };
  }

  async setRefreshToken(
    userId: string,
    token: string,
    jti: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const hashed = await argon2.hash(token);

    await this.userTokenRepo.insert({
      jti,
      revoked: false,
      revokedAt: null,
      user: { id: userId },
      createdAt: new Date(),
      refreshToken: hashed,
      deviceInfo,
      ipAddress,
    });
  }

  async validateRefreshToken(userId: string, token: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(token, {
        secret: this.jwtConfig.refreshTokenSecret,
      });
    } catch {
      return false;
    }

    if (!decoded?.jti) return false;

    const session = await this.userTokenRepo.findOne({
      where: { jti: decoded.jti, user: { id: userId }, revoked: false },
    });

    if (!session) return false;

    return await argon2.verify(session.refreshToken, token);
  }

  async removeRefreshToken(userId: string) {
    await this.userService.update(userId, { refreshToken: null });

    await this.userTokenRepo.update(
      { user: { id: userId }, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
    findUser: (id: string) => Promise<any>,
  ) {
    const valid = await this.validateRefreshToken(userId, refreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const decoded = this.jwtService.decode(refreshToken) as any;
    if (!decoded?.jti)
      throw new UnauthorizedException('Refresh token missing jti');

    const user = await findUser(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.userTokenRepo.update(
      { jti: decoded.jti, user: { id: userId }, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      jti: decoded.jti,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessTokenSecret,
      expiresIn: this.jwtConfig.accessTokenExpiresIn,
    });

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshTokenSecret,
      expiresIn: this.jwtConfig.refreshTokenExpiresIn,
    });

    const hashed = await argon2.hash(newRefreshToken);

    await this.userTokenRepo.update(
      { jti: decoded.jti, user: { id: userId } },
      { refreshToken: hashed, revoked: false, createdAt: new Date() },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  decodeRefreshToken(token: string) {
    return this.jwtService.decode(token) as any;
  }

  async revokeToken(userId: string, refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken) as any;
    if (!decoded?.jti) return;

    const session = await this.userTokenRepo.findOne({
      where: { jti: decoded.jti, user: { id: userId }, revoked: false },
    });

    if (session) {
      await this.userTokenRepo.update(session.id, {
        revoked: true,
        revokedAt: new Date(),
      });
    }
  }

  async verifyAccessToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.jwtConfig.accessTokenSecret,
    });

    if (!payload?.jti) {
      throw new UnauthorizedException('Invalid token: missing jti');
    }

    const session = await this.userTokenRepo.findOne({
      where: { jti: payload.jti, revoked: false },
    });

    if (!session) {
      throw new UnauthorizedException('Token revoked or not found');
    }

    return payload;
  }

  async revokeAllTokens(userId: string) {
    await this.userTokenRepo.update(
      { user: { id: userId }, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    this.authGateway.logoutAll(userId);
  }
}
