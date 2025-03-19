import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Put,
  Request,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/decorators/custompublic';
import { User } from 'database/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return await this.authService.login(body.username, body.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Get('refresh')
  async refreshTokens(@Request() req) {
    const refreshToken =
      req.cookies?.refresh_token || req.headers['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token missing');
    }

    // Gọi service để làm mới access token
    const newAccessToken = await this.authService.refreshAccessToken(
      refreshToken,
    );

    // Trả về Access Token mới
    return { newaccessToken: newAccessToken };
  }

  @Put('update/:id')
  async Update(
    @Param('id') id: number,
    @Body() updateuser: UpdateUserDto,
    @Request() req,
  ) {
    const user = req.user;
    console.log(req.user);
    console.log(user.role);
    console.log(user.id);
    if (user.role !== 'ADMIN' && user.id !== id) {
      throw new UnauthorizedException(
        'You do not have permission to update this user',
      );
    }
    return await this.userService.update(id, updateuser);
  }
}
