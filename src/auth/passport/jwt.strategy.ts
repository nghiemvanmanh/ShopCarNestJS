import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'node_modules/@nestjs/config';
import { InjectRepository } from 'node_modules/@nestjs/typeorm';
import { Repository } from 'node_modules/typeorm';
import { User } from 'database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      sub: payload.sub,
      role: payload.role,
    };
  }
}
