import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import jwtConfig from '../config/jwt.config';
import { UserToken } from '../entity/user-tokens.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly jwtCfg: ConfigType<typeof jwtConfig>;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserToken)
    private readonly userTokenRepo: Repository<UserToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<ConfigType<typeof jwtConfig>>('jwt')
          ?.accessTokenSecret!,
    });

    this.jwtCfg = this.configService.get<ConfigType<typeof jwtConfig>>('jwt')!;
  }

  async validate(payload: JwtPayload) {
    if (!payload?.jti) {
      throw new UnauthorizedException('Token missing jti');
    }

    const session = await this.userTokenRepo.findOne({
      where: { jti: payload.jti, revoked: false },
    });

    if (!session) {
      throw new UnauthorizedException('Token revoked or invalid');
    }

    return payload;
  }
}
