import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

// In your register method, wrap email sending in try-catch
async register(registerDto: RegisterDto): Promise<{ user: any; token: string }> {
  const { email, password, displayName } = registerDto;

  // Check if user exists
  const existingUser = await this.userModel.findOne({ email });
  if (existingUser) {
    throw new ConflictException('User already exists');
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await this.userModel.create({
    email,
    passwordHash,
    displayName,
    role: 'user',
    isEmailVerified: false,
    emailVerificationToken,
    emailVerificationExpires,
  });

  // Try to send verification email (non-blocking)
  try {
    await this.emailService.sendVerificationEmail(email, emailVerificationToken, displayName);
  } catch (error) {
    // Log error but don't fail registration
    console.error('Failed to send verification email:', error.message);
    // You could queue this for retry later
  }

  // Generate token (with limited permissions until email is verified)
  const token = this.jwtService.sign({ 
    userId: user._id, 
    email: user.email,
    role: user.role,
    isEmailVerified: false
  });

  // Return user without password
  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.emailVerificationToken;

  return { user: userObj, token };
}

  async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    const { email, password } = loginDto;

    // Check if account is locked
    const lockedUser = await this.userModel.findOne({
      email,
      lockUntil: { $gt: new Date() }
    });
    if (lockedUser) {
      throw new ForbiddenException('Account is temporarily locked due to too many failed attempts');
    }

    // Find user
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user);

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new ForbiddenException('Please verify your email address before logging in');
    }

    // Generate token
    const token = this.jwtService.sign({ 
      userId: user._id, 
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return { user: userObj, token };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.displayName);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    await this.emailService.sendVerificationEmail(email, emailVerificationToken, user.displayName);

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email, isActive: true, isEmailVerified: true });
    if (!user) {
      // Don't reveal whether email exists or not
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    await this.emailService.sendPasswordResetEmail(email, resetToken, user.displayName);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  private async incrementLoginAttempts(user: UserDocument) {
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

    if (user.lockUntil && user.lockUntil > new Date()) {
      return; // Already locked
    }

    const updates: any = {
      $inc: { loginAttempts: 1 }
    };

    if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
      updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
    }

    await this.userModel.findByIdAndUpdate(user._id, updates);
  }

  private async resetLoginAttempts(user: UserDocument) {
    await this.userModel.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    });
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.userModel.findById(payload.userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}