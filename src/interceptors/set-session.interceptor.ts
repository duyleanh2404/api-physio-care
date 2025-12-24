import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class SetPostgresSessionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    let user = request.user;

    if (!user) {
      const auth = request.headers['authorization'];
      if (auth?.startsWith('Bearer ')) {
        try {
          const token = auth.slice(7);
          user = this.jwtService.verify(token);
          request.user = user;
        } catch (err) {
          return next.handle();
        }
      }
    }

    if (!user) return next.handle();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const currentUserId = user.doctorId ?? user.clinicId ?? user.sub;

    await queryRunner.query(`SET app.current_user_role = '${user.role}'`);
    await queryRunner.query(`SET app.current_user_id = '${currentUserId}'`);

    request.queryRunner = queryRunner;

    return next.handle().pipe(
      tap(async () => {
        await queryRunner.release();
      }),
      catchError(async (err) => {
        await queryRunner.release();
        throw err;
      }),
    );
  }
}
