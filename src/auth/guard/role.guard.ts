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
    const userId = +request.params.id; // ID từ URL
    const method = request.method; // Lấy method (PUT hoặc DELETE)

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Admin được phép mọi hành động
    if (user.role === 'ADMIN') {
      return true;
    }

    // Nếu không phải Admin, chặn việc xoá user
    if (method === 'DELETE') {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }

    // User chỉ được phép cập nhật chính họ
    if (method === 'PUT' && user.id !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this user',
      );
    }

    return true;
  }
}
