import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = +user.id; // ID từ URL
    const method = request.method; // Lấy method (PUT hoặc DELETE)

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // User chỉ được phép cập nhật chính họ
    if (user.id !== userId) {
      throw new UnauthorizedException('You do not have permission');
    }

    return true;
  }
}
