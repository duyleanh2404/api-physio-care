import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtPayload } from 'src/core/auth/interfaces/jwt-payload.interface';

@Injectable()
export class SetPostgresSessionInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (user) {
      const currentUserId =
        (user as any).doctorId ?? (user as any).clinicId ?? user.sub;

      await this.dataSource.query(
        `SET app.current_user_role = '${user.role}'; SET app.current_user_id = '${currentUserId}';`,
      );
    }

    return next.handle();
  }
}
