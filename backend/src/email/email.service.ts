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
      throw new Error('RESEND_API_KEY is required');
    }

    this.resend = new Resend(apiKey);
    this.logger.log('✅ Resend email service initialized');
  }

  async sendVerificationEmail(email: string, token: string, displayName: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital&apos;s <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: "Verify Your Email Address - Forbes Digital's",
        text: `Hello ${displayName},\n\nPlease verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nForbes Digital&apos;s Team`,
        html: `
          <DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h1 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">Hello, ${displayName}</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                          Thank you for signing up with Forbes Digital&apos;s. Please verify your email address to complete your registration.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="border-radius: 4px; background-color: #007bff;">
                              <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                          Or copy and paste this link in your browser:<br>
                          <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
                        </p>
                        <p style="color: #999; font-size: 12px; margin: 25px 0 0 0; padding-top: 25px; border-top: 1px solid #eee;">
                          This link will expire in 24 hours. If you didn't create an account with Forbes Digital&apos;s, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                    © ${new Date().getFullYear()} Forbes Digital&apos;s Lifeline. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
        from: `Forbes Digital&apos;s <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: 'Reset Your Password - Forbes Digital&apos;s',
        text: `Hello ${displayName},\n\nYou requested to reset your password. Visit this link to proceed: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nForbes Digital&apos;s Team`,
        html: `
          <DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h1 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">Password Reset Request</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                          Hello ${displayName},
                        </p>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                          We received a request to reset your password. Click the button below to create a new password.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="border-radius: 4px; background-color: #dc3545;">
                              <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                          Or copy and paste this link in your browser:<br>
                          <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">${resetUrl}</a>
                        </p>
                        <p style="color: #999; font-size: 12px; margin: 25px 0 0 0; padding-top: 25px; border-top: 1px solid #eee;">
                          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                    © ${new Date().getFullYear()} Forbes Digital&apos;s Lifeline. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
        from: `Forbes Digital&apos;s <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: "Welcome to Forbes Digital's 🥳" ,
        text: `Welcome aboard, ${displayName}\n\nYour account has been successfully created and verified.\n\nWe're excited to have you with us\n\nBest regards,\nForbes Digital&apos;s Team`,
        html: `
          <DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 30px; text-align: center;">
                        <h1 style="color: #333; font-size: 28px; margin: 0 0 10px 0;">Welcome aboard, ${displayName} 🥳</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                          Your account has been successfully created and verified.
                        </p>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                          We're excited to have you with us at Forbes Digital&apos;s
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                          <tr>
                            <td style="border-radius: 4px; background-color: #28a745;">
                              <a href="${process.env.FRONTEND_URL}" target="_blank" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Get Started
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #999; font-size: 12px; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #eee;">
                          If you have any questions, feel free to reach out to our support team.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                    © ${new Date().getFullYear()} Forbes Digital&apos;s Lifeline. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
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