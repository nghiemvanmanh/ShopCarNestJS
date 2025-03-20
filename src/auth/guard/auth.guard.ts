import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/custompublic';
import { RefreshToken } from 'database/entities/refresh-token';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const accessToken = authHeader.split(' ')[1];
    try {
      //Kiểm tra Access Token
      const payload = this.jwtService.verify(accessToken);
      request['user'] = payload;
      return true;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        //Access Token hết hạn → Kiểm tra Refresh Token
        const refreshToken = request.cookies['refresh_token']; // Lấy từ cookie
        if (!refreshToken) {
          throw new UnauthorizedException('Refresh Token missing');
        }

        //Kiểm tra Refresh Token trong DB
        const storedToken = await this.refreshTokenRepository.findOne({
          where: { token: refreshToken },
          relations: ['user'],
        });

        if (!storedToken) {
          throw new UnauthorizedException('Invalid Refresh Token');
        }

        // Cấp Access Token mới
        const newAccessToken = this.jwtService.sign(
          { sub: storedToken.user.email, role: storedToken.user.role }, // Hoặc lấy từ Config
        );

        //Gửi Access Token mới trong header
        response.setHeader('Authorization', `Bearer ${newAccessToken}`);

        //Lưu user vào request để controller dùng
        request['user'] = this.jwtService.verify(newAccessToken);
        return true;
      }

      throw new UnauthorizedException('Invalid Access Token');
    }
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token is not authorized');
    }
    return user;
  }
}
