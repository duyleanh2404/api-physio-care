import { v4 as uuidv4 } from 'uuid';
import type { RedisClientType } from 'redis';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { io } from './qr.gateway';
import { UserService } from 'src/modules/users/user.service';
import { TokenRepository } from '../auth/repository/token.repository';

@Injectable()
export class QrService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
    private readonly userService: UserService,
    private readonly tokenRepo: TokenRepository,
  ) {}

  async createQrByEmail(email: string, ipAddress: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const nonce = uuidv4();
    const key = `qr:${nonce}`;

    const payload = {
      status: 'pending',
      createdAt: Date.now(),
      ipAddress,
      email: user.email,
      userId: user.id,
    };

    await this.redis.set(key, JSON.stringify(payload), { EX: 120 });
    return {
      nonce,
      qrUrl: `${process.env.FRONTEND_URL}/qr-login?nonce=${nonce}`,
    };
  }

  async confirmQrLogin(nonce: string, mobileUserId: string) {
    const key = `qr:${nonce}`;
    const raw = await this.redis.get(key);
    if (!raw) throw new NotFoundException('QR code expired or invalid');

    const data = JSON.parse(raw);
    if (data.status !== 'pending')
      throw new NotFoundException('QR code already used');

    const mobileUser = await this.userService.findById(mobileUserId);
    if (!mobileUser) throw new NotFoundException('Mobile user not found');

    const user = await this.userService.findById(data.userId);
    const tokens = await this.tokenRepo.generateTokens(
      user,
      'QR-login',
      data.ipAddress,
    );

    io.to(`qr:${nonce}`).emit('authenticated', {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      ...tokens,
    });

    await this.redis.set(
      key,
      JSON.stringify({ ...data, status: 'used', usedBy: mobileUser.id }),
      { EX: 30 },
    );

    return { message: 'QR login successful' };
  }
}
