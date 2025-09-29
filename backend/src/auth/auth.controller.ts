import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('Profile request - User:', req.user);
    const user = req.user.toObject();
    delete user.passwordHash;
    return user;
  }

  // Debug endpoint to check token
  @UseGuards(JwtAuthGuard)
  @Get('debug')
  debugAuth(@Request() req) {
    return {
      message: 'Token is valid',
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }
}