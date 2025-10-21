import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      this.logger.error('❌ RESEND_API_KEY is not set');
      throw new Error('RESEND_API_KEY is required!');
    }

    this.resend = new Resend(apiKey);
    this.logger.log('✅ Resend email service initialized');
  }

  async sendVerificationEmail(email: string, token: string, displayName: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello, ${displayName}!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`❌ Failed to send verification email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Verification email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending verification email:`, error.message);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, displayName: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${displayName},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`❌ Failed to send password reset email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Password reset email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending password reset email:`, error.message);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, displayName: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Welcome to Our App!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome aboard, ${displayName}!</h2>
            <p>Your account has been successfully created and verified.</p>
            <p>We're excited to have you with us!</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`❌ Failed to send welcome email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Welcome email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending welcome email:`, error.message);
      throw error;
    }
  }
}