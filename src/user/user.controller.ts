import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Put,
  UseGuards,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/decorators/custompublic';
import { User } from 'database/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserGuard } from 'src/auth/guard/user.guard';
import { AdminGuard } from 'src/auth/guard/admin.guard';

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

  @UseGuards(UserGuard)
  @UseGuards(AdminGuard)
  @Put('update')
  async update(
    @Param('id') id: number,
    @Body() updateUser: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.update(id, updateUser);
  }

  @UseGuards(AdminGuard)
  @Delete('delete')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
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

  @Post('review')
  async createReview(
    @Request() req,
    @Param('productId') productId: number,
    @Body()
    body: { rating: number; comment: string },
  ) {
    const userId = req.user.id;
    return await this.userService.createReview(
      userId,
      productId,
      body.rating,
      body.comment,
    );
  }
  @Post('refresh')
  async RefreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;

    // Gọi service để làm mới access token
    const newAccessToken = await this.authService.refreshAccessToken(
      refreshToken,
    );

    if (!newAccessToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Trả về access token mới
    return {
      accessToken: newAccessToken,
    };
  }
}
