import { Controller, Post, Body, Query, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorators';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Get('email-confirmation')
  emailConfirmation(@Query('token') token: string) {
    return this.authService.emailConfirmation(token);
  }
  @UseGuards(AuthGuard)
  @Get('user/me')
  getProfileUser(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
