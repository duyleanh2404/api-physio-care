import {
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';

import jwtConfig from './config/jwt.config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'auth',
})
@Injectable()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, Set<string>>();
  private readonly jwtConfig: ConfigType<typeof jwtConfig>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig =
      this.configService.get<ConfigType<typeof jwtConfig>>('jwt')!;
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return client.disconnect();

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.jwtConfig.accessTokenSecret,
      });
    } catch {
      return client.disconnect();
    }

    const userId = payload.sub;
    if (!userId) return client.disconnect();

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(client.id);
  }

  handleDisconnect(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return;

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.jwtConfig.accessTokenSecret,
      });
    } catch {
      return;
    }

    const userId = payload.sub;
    this.userSockets.get(userId)?.delete(client.id);

    if (this.userSockets.get(userId)?.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  logoutAll(userId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    for (const socketId of sockets) {
      this.server.to(socketId).emit('logout-all');
    }

    this.userSockets.delete(userId);
  }
}
