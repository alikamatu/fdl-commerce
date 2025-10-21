import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    });

    this.logger.log('✅ Gmail email service initialized');
  }

  async sendVerificationEmail(email: string, token: string, displayName: string) {
    const verificationUrl = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
    
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
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

      this.logger.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error.message);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, displayName: string) {
    const resetUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
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

      this.logger.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send password reset email to ${email}:`, error.message);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, displayName: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
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

      this.logger.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${email}:`, error.message);
      throw error;
    }
  }

  async sendVerificationApproval(email: string): Promise<void> {
    const subject = 'Admin Verification Approved';
    const html = `<p>Your admin verification request has been approved. You can now access the admin dashboard.</p>`;
    await this.sendEmail(email, subject, html);
  }

  async sendVerificationRejection(email: string, reason: string): Promise<void> {
    const subject = 'Admin Verification Rejected';
    const html = `<p>Your admin verification request was rejected. Reason: ${reason}</p>`;
    await this.sendEmail(email, subject, html);
  }

  async sendNewVerificationRequest(email: string): Promise<void> {
    const subject = 'New Admin Verification Request';
    const html = `<p>A new admin verification request needs your review.</p>`;
    await this.sendEmail(email, subject, html);
  }

  private async sendEmail(email: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to: email,
        subject,
        html,
      });
      this.logger.log(`✅ Email sent to ${email}: ${subject}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${email}:`, error.message);
      throw error;
    }
  }
}