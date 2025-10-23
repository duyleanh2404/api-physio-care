import {
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class QrGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { key: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.key);
  }
}

export const io = {
  to: (room: string) => ({
    emit: (event: string, payload: any) => {},
  }),
};
