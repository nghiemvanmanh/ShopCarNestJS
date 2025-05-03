import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin được phép mọi hành động
    if (user.role === 'ADMIN') {
      return true;
    }
    throw new UnauthorizedException('You do not have permission');
  }
}
