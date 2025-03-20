import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/decorators/custompublic';
import { User } from 'database/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() newUSer: CreateUserDto): Promise<User> {
    return await this.userService.register(newUSer);
  }

  @Public()
  @Post()
  async login(@Body() body: { username: string; password: string }) {
    return await this.authService.login(body.username, body.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
