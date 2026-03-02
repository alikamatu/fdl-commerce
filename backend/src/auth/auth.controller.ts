import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  async googleAuth() {
    // This route redirects to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Get the token from the validated user
    const { token } = req.user;

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // Google login with token (for frontend)
  @Post('google/login')
  async googleLogin(@Body() body: { token: string }) {
    return this.authService.googleLogin(body.token);
  }

  // Link Google account to existing account
  @UseGuards(JwtAuthGuard)
  @Post('google/link')
  async linkGoogleAccount(@Request() req, @Body() body: { token: string }) {
    const result = await this.authService.googleLogin(body.token);

    // Link Google ID to current user
    await this.authService.linkGoogleAccount(
      req.user._id,
      result.user.googleId,
    );

    return { message: 'Google account linked successfully' };
  }

  // Unlink Google account
  @UseGuards(JwtAuthGuard)
  @Post('google/unlink')
  async unlinkGoogleAccount(@Request() req) {
    await this.authService.unlinkGoogleAccount(req.user._id);
    return { message: 'Google account unlinked successfully' };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user._id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('Profile request - User:', req.user);
    const user = req.user.toObject();
    delete user.passwordHash;
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug')
  debugAuth(@Request() req) {
    return {
      message: 'Token is valid',
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
