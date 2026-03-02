import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('=== JWT Validation Start ===');
    console.log('Payload:', payload);
    console.log('Looking for userId:', payload.userId);

    const user = await this.userModel
      .findById(payload.userId)
      .select('-passwordHash');

    console.log('User found:', !!user);
    if (user) {
      console.log('User email:', user.email);
      console.log('User active:', user.isActive);
    }

    if (!user || !user.isActive) {
      console.log('❌ JWT Validation FAILED - User not found or inactive');
      throw new UnauthorizedException('User not found or inactive');
    }

    console.log('✅ JWT Validation SUCCESS');
    return user;
  }
}
