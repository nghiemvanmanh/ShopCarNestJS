import { NestFactory, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from './auth/guard/auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { RefreshToken } from 'database/entities/refresh-token';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const refreshTokenRepository = app.get(getRepositoryToken(RefreshToken));
  app.useGlobalGuards(
    new JwtAuthGuard(reflector, jwtService, refreshTokenRepository),
  );
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép từ Next.js
    credentials: true, // Nếu dùng cookies hay headers đặc biệt
  });
  await app.listen(process.env.PORT);
}
bootstrap();
