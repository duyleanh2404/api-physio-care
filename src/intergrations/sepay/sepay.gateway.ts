import {
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['https://physiocare.io.vn', 'http://localhost:3000'],
    credentials: true,
  },
  path: '/socket.io',
})
export class SepayGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() code: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(code);
    console.log(`Client joined room ${code}`);
  }

  sendPaymentSuccess(code: string, data: any) {
    this.server.to(code).emit('payment_success', data);
  }

  sendPaymentFailed(code: string, data: any) {
    this.server.to(code).emit('payment_failed', data);
  }
}
