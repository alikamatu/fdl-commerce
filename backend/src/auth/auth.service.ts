import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

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

    // Create user
    const user = await this.userModel.create({
      email,
      passwordHash,
      displayName,
      role: 'user', // Default to user for this app
    });

    // Generate token
    const token = this.jwtService.sign({ 
      userId: user._id, 
      email: user.email,
      role: user.role 
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return { user: userObj, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.jwtService.sign({ 
      userId: user._id, 
      email: user.email,
      role: user.role 
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return { user: userObj, token };
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.userModel.findById(payload.userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}