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

  // Keep existing verification, password reset, and welcome emails as they are
  async sendVerificationEmail(email: string, token: string, displayName: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: "Verify Your Email Address - Forbes Digital Lifeline",
        text: `Hello ${displayName},\n\nPlease verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nForbes Digital Lifeline Team`,
        html: `
          <!DOCTYPE html>
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
                          Thank you for signing up with Forbes Digital Lifeline. Please verify your email address to complete your registration.
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
                          This link will expire in 24 hours. If you did not create an account with Forbes Digital Lifeline, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                    © 2020-${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.
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
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: 'Reset Your Password - Forbes Digital Lifeline',
        text: `Hello ${displayName},\n\nYou requested to reset your password. Visit this link to proceed: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nForbes Digital Lifeline Team`,
        html: `
          <!DOCTYPE html>
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
                          This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                    © 2020-${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.
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
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: "Welcome to Forbes Digital Lifeline",
        text: `Welcome! ${displayName}\n\nYour account has been successfully created and verified.\n\nWe're excited to have you with us\n\nBest regards,\nForbes Digital Lifeline Team`,
        html: `
          <!DOCTYPE html>
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
                        <h1 style="color: #333; font-size: 28px; margin: 0 0 10px 0;">Welcome! ${displayName} 🥳</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                          Your account has been successfully created and verified.
                        </p>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                          We are excited to have you with us at Forbes Digital Lifeline.
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
                          If you have any questions, feel free to reach out to our info team.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                    © 2020-${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.
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

  async sendOrderConfirmationEmail(email: string, displayName: string, orderNumber: string, orderDetails: any) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: `Order Confirmed - ${orderNumber} - Forbes Digital Lifeline`,
        text: this.generateOrderText(displayName, orderNumber, orderDetails, 'confirmed'),
        html: this.generateOrderHTML(displayName, orderNumber, orderDetails, 'confirmed'),
      });

      if (error) {
        this.logger.error(`❌ Failed to send order confirmation email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Order confirmation email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending order confirmation email:`, error.message);
      throw error;
    }
  }

  async sendShippingNotificationEmail(email: string, displayName: string, orderNumber: string, orderDetails: any) {
    const deliveryMethod = orderDetails.deliveryMethod || 'delivery';
    const subject = deliveryMethod === 'delivery' 
      ? `Your Order ${orderNumber} is Out for Delivery - Forbes Digital Lifeline`
      : `Your Order ${orderNumber} is Ready for Pickup - Forbes Digital Lifeline`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: subject,
        text: this.generateOrderText(displayName, orderNumber, orderDetails, 'shipping'),
        html: this.generateOrderHTML(displayName, orderNumber, orderDetails, 'shipping'),
      });

      if (error) {
        this.logger.error(`❌ Failed to send shipping notification email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Shipping notification email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending shipping notification email:`, error.message);
      throw error;
    }
  }

  async sendPickupNotificationEmail(email: string, displayName: string, orderNumber: string, orderDetails: any) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: `Your Order ${orderNumber} is Ready for Pickup - Forbes Digital Lifeline`,
        text: this.generateOrderText(displayName, orderNumber, orderDetails, 'pickup'),
        html: this.generateOrderHTML(displayName, orderNumber, orderDetails, 'pickup'),
      });

      if (error) {
        this.logger.error(`❌ Failed to send pickup notification email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Pickup notification email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending pickup notification email:`, error.message);
      throw error;
    }
  }

  async sendDeliveredNotificationEmail(email: string, displayName: string, orderNumber: string, orderDetails: any) {
    const deliveryMethod = orderDetails.deliveryMethod || 'delivery';
    const subject = `Order ${orderNumber} ${deliveryMethod === 'delivery' ? 'Delivered' : 'Picked Up'} - Forbes Digital Lifeline`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: email,
        subject: subject,
        text: this.generateOrderText(displayName, orderNumber, orderDetails, 'delivered'),
        html: this.generateOrderHTML(displayName, orderNumber, orderDetails, 'delivered'),
      });

      if (error) {
        this.logger.error(`❌ Failed to send delivered notification email to ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Delivered notification email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending delivered notification email:`, error.message);
      throw error;
    }
  }

  async sendNewOrderNotificationToAdmin(order: any, adminEmail: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `Forbes Digital Lifeline <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: adminEmail,
        subject: `📦 New Order Received - ${order.orderNumber}`,
        text: this.generateAdminOrderText(order),
        html: this.generateAdminOrderHTML(order),
      });

      if (error) {
        this.logger.error(`❌ Failed to send new order notification to admin:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ New order notification sent to admin (ID: ${data?.id})`);
      return data;
    } catch (error) {
      this.logger.error(`❌ Error sending new order notification to admin:`, error.message);
      throw error;
    }
  }

  // Helper method to generate text version of order emails
  private generateOrderText(displayName: string, orderNumber: string, orderDetails: any, emailType: string): string {
    const items = orderDetails.items || [];
    const subtotalCents = orderDetails.subtotalCents || 0;
    const shippingCents = orderDetails.shippingCents || 0;
    const totalCents = orderDetails.totalCents || 0;
    const deliveryMethod = orderDetails.deliveryMethod || 'delivery';
    const shippingAddress = orderDetails.shippingAddress || {};

    let headerText = '';
    let statusText = '';

    switch (emailType) {
      case 'confirmed':
        headerText = 'Order Confirmation';
        statusText = 'Thank you for your purchase! Your order has been confirmed and is now being processed.';
        break;
      case 'shipping':
        headerText = deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup';
        statusText = deliveryMethod === 'delivery' 
          ? 'Great news! Your order is out for delivery and will arrive soon.'
          : 'Great news! Your order is ready for pickup at our location.';
        break;
      case 'pickup':
        headerText = 'Ready for Pickup';
        statusText = 'Your order is now ready for pickup! Please bring your order confirmation and valid ID.';
        break;
      case 'delivered':
        headerText = deliveryMethod === 'delivery' ? 'Order Delivered' : 'Order Picked Up';
        statusText = deliveryMethod === 'delivery'
          ? 'Your order has been successfully delivered! Thank you for shopping with us.'
          : 'Your order has been picked up! Thank you for shopping with us.';
        break;
    }

    let text = `Hello ${displayName},\n\n`;
    text += `${statusText}\n\n`;
    text += `${headerText.toUpperCase()}\n`;
    text += `Order Number: ${orderNumber}\n`;
    text += `Order Date: ${new Date().toLocaleDateString()}\n\n`;
    
    text += `ITEMS:\n`;
    text += `${'-'.repeat(60)}\n`;
    
    if (items.length > 0) {
      items.forEach((item: any) => {
        text += `${item.title || 'Unknown Item'}\n`;
        text += `Quantity: ${item.quantity || 0} × GH₵${((item.priceCents || 0) / 100).toFixed(2)}\n`;
        text += `Total: GH₵${(((item.priceCents || 0) * (item.quantity || 0)) / 100).toFixed(2)}\n\n`;
      });
    } else {
      text += `No items details available\n\n`;
    }
    
    text += `${'-'.repeat(60)}\n`;
    text += `Subtotal: GH₵${(subtotalCents / 100).toFixed(2)}\n`;
    text += `${deliveryMethod} Fee: GH₵${(shippingCents / 100).toFixed(2)}\n`;
    text += `TOTAL: GH₵${(totalCents / 100).toFixed(2)}\n\n`;
    
    text += `${deliveryMethod.toUpperCase()} INFORMATION:\n`;
    text += `Method: ${deliveryMethod}\n`;
    text += `Payment: ${deliveryMethod === "delivery" ? "Cash on Delivery" : "Cash/Momo"}\n`;
    
    if (emailType === 'delivered') {
      text += `Status: Completed\n\n`;
    } else if (emailType === 'shipping' || emailType === 'pickup') {
      text += `Status: ${emailType === 'shipping' ? 'Out for Delivery' : 'Ready for Pickup'}\n\n`;
    } else {
      text += `Status: Confirmed\n\n`;
    }
    
    text += `${deliveryMethod.toUpperCase()} ADDRESS:\n`;
    if (shippingAddress.firstName) {
      text += `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}\n`;
      text += `${shippingAddress.address || ''}\n`;
      text += `${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}\n`;
      text += `${shippingAddress.country || ''}\n`;
      text += `${shippingAddress.phone || 'Not provided'}\n\n`;
    } else {
      text += `Address not available\n\n`;
    }
    
    text += `Track your order: ${process.env.FRONTEND_URL}\n\n`;
    
    text += `CONTACT INFORMATION:\n`;
    text += `Forbes Digital Lifeline\n`;
    text += `Website: https://forbesdigitals.com\n`;
    text += `Email: info@forbesdigitals.com\n`;
    text += `Phone: +233 54 712 9636\n\n`;
    
    text += `Thank you for choosing Forbes Digital Lifeline!\n\n`;
    text += `Best regards,\n`;
    text += `The Forbes Digital Lifeline Team\n\n`;
    text += `© ${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.`;

    return text;
  }
  

  // Helper method to generate HTML version of order emails
  private generateOrderHTML(displayName: string, orderNumber: string, orderDetails: any, emailType: string): string {
    const items = orderDetails.items || [];
    const subtotalCents = orderDetails.subtotalCents || 0;
    const shippingCents = orderDetails.shippingCents || 0;
    const totalCents = orderDetails.totalCents || 0;
    const deliveryMethod = orderDetails.deliveryMethod || 'delivery';
    const shippingAddress = orderDetails.shippingAddress || {};
    const paymentMethod = orderDetails.paymentMethod || 'cash'

    let headerTitle = '';
    let headerEmoji = '';
    let statusMessage = '';
    let statusColor = '#28a745';
    let statusBadge = 'Confirmed';
    let buttonColor = '#000000';
    let buttonText = 'Track Your Order';
    let additionalInfo = '';

      const formatPaymentMethod = (method: string) => {
  switch (method.toLowerCase()) {
    case 'mobile_money':
      return 'Mobile Money (MoMo)';
    case 'cash':
      return 'Cash';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'cash_or_momo':
      return 'N/A';
    default:
      return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};


    switch (emailType) {
      case 'confirmed':
        headerTitle = 'Order Confirmation';
        headerEmoji = '✅';
        statusMessage = 'Thank you for your purchase! Your order has been confirmed and is now being processed.';
        statusColor = '#28a745';
        statusBadge = 'Confirmed';
        buttonColor = '#000000';
        buttonText = 'Track Your Order';
        break;
      case 'shipping':
        headerTitle = deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup';
        headerEmoji = deliveryMethod === 'delivery' ? '🚚' : '📦';
        statusMessage = deliveryMethod === 'delivery' 
          ? 'Great news! Your order is out for delivery and will arrive soon.'
          : 'Great news! Your order is ready for pickup at our location.';
        statusColor = '#007bff';
        statusBadge = deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup';
        buttonColor = '#007bff';
        buttonText = deliveryMethod === 'delivery' ? 'Track Delivery' : 'View Pickup Details';
        if (deliveryMethod !== 'delivery') {
          additionalInfo = `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>✍️ Take Note</strong> Please show your order details to pickup your order
              </p>
            </div>
          `;
        }
        break;
      case 'pickup':
        headerTitle = 'Ready for Pickup';
        headerEmoji = '📦';
        statusMessage = 'Your order is now ready for pickup at our location!';
        statusColor = '#ffc107';
        statusBadge = 'Ready for Pickup';
        buttonColor = '#ffc107';
        buttonText = 'View Pickup Details';
        additionalInfo = `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>📍 Important:</strong> Please bring your order confirmation and a valid ID when picking up your order.
            </p>
          </div>
        `;
        break;
      case 'delivered':
        headerTitle = deliveryMethod === 'delivery' ? 'Order Delivered' : 'Order Picked Up';
        headerEmoji = '🎉';
        statusMessage = deliveryMethod === 'delivery'
          ? 'Your order has been successfully delivered! We hope you enjoy your purchase.'
          : 'Your order has been picked up! We hope you enjoy your purchase.';
        statusColor = '#28a745';
        statusBadge = 'Completed';
        buttonColor = '#6c757d';
        buttonText = 'View Order Details';
        additionalInfo = `
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #155724; font-size: 14px;">
              <strong>✓ Order Completed Successfully!</strong> If you need any info with your purchase, don't hesitate to contact us.
            </p>
          </div>
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${headerTitle} - Forbes Digital Lifeline</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f7f7;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #000000; padding: 30px 30px; text-align: center;">
                    <div style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 10px;">Forbes Digital Lifeline</div>
                    <div style="color: #cccccc; font-size: 16px;">Your Digital 🆘</div>
                    <h1 style="color: #ffffff; margin: 15px 0 0 0; font-size: 24px; font-weight: 600;">${headerEmoji} ${headerTitle}</h1>
                  </td>
                </tr>

                <!-- Customer Greeting -->
                <tr>
                  <td style="padding: 40px 30px 20px 30px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 20px;">Hello ${displayName},</h2>
                    <p style="margin: 0; color: #555; font-size: 16px;">${statusMessage}</p>
                  </td>
                </tr>

                <!-- Order Summary Table -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">Order Summary - ${orderNumber}</h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="text-align: left; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Item</th>
                          <th style="text-align: center; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Qty</th>
                          <th style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Price</th>
                          <th style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${items.map((item: any) => `
                        <tr>
                          <td style="padding: 12px 15px; border: 1px solid #dee2e6;">${item.title || 'Unknown Item'}</td>
                          <td style="text-align: center; padding: 12px 15px; border: 1px solid #dee2e6;">${item.quantity || 0}</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${((item.priceCents || 0) / 100).toFixed(2)}</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${(((item.priceCents || 0) * (item.quantity || 0)) / 100).toFixed(2)}</td>
                        </tr>
                        `).join('')}
                        ${items.length === 0 ? `
                        <tr>
                          <td colspan="4" style="padding: 12px 15px; border: 1px solid #dee2e6; text-align: center; color: #666;">
                            No items details available
                          </td>
                        </tr>
                        ` : ''}
                      </tbody>
                      <tfoot style="background-color: #f8f9fa; font-weight: 600;">
                        <tr>
                          <td colspan="3" style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">Subtotal:</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${(subtotalCents / 100).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colspan="3" style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; text-transform: capitalize;">${deliveryMethod} Fee:</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${(shippingCents / 100).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colspan="3" style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-size: 17px;">Total:</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-size: 17px;">GH₵${(totalCents / 100).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>

                ${additionalInfo ? `
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    ${additionalInfo}
                  </td>
                </tr>
                ` : ''}

                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 15px;">
                          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333; text-transform: capitalize;">${deliveryMethod} Information</h4>
                            <p style="margin: 0; color: #555; font-size: 14px;">
                              <strong>Method:</strong> <span style="text-transform: capitalize;">${deliveryMethod}</span><br>
                              <strong>Payment:</strong> <span style="text-transform: capitalize;">${formatPaymentMethod(paymentMethod)}</span> <br>
                              <strong>Status:</strong> <span style="color: ${statusColor};">${statusBadge}</span>
                            </p>
                          </div>
                        </td>
                        <td width="50%" style="vertical-align: top; padding-left: 15px;">
                          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333; text-transform: capitalize;">${deliveryMethod} Address</h4>
                            <p style="margin: 0; color: #555; font-size: 14px;">
                              ${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}<br>
                              ${shippingAddress.address || 'Address not available'}<br>
                              ${deliveryMethod === 'delivery' ? `${shippingAddress.city || ''}, ${shippingAddress.state || ''} <br>` : ''}
                              ${shippingAddress.country || ''}<br>
                              ${shippingAddress.phone || 'Not provided'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Call to Action -->
                <tr>
                  <td style="padding: 0 30px 30px 30px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 4px; background-color: ${buttonColor};">
                          <a href="${process.env.FRONTEND_URL}" target="_blank" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                            ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">You can check your order status anytime by visiting our website.</p>
                  </td>
                </tr>

                <!-- Professional Email Signature -->
                <tr>
                  <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: top;">
                          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #000000;">Forbes Digital Lifeline</h3>
                          <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;">Your Digital 🆘</p>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 15px 0;">
                            <tr>
                              <td style="padding-right: 15px; vertical-align: top;">
                                <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;"><strong>Website:</strong></p>
                              </td>
                              <td>
                                <p style="margin: 0 0 5px 0; font-size: 14px;"><a href="https://forbesdigitals.com" style="color: #007bff; text-decoration: none;">forbesdigitals.com</a></p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-right: 15px; vertical-align: top;">
                                <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;"><strong>Email:</strong></p>
                              </td>
                              <td>
                                <p style="margin: 0 0 5px 0; font-size: 14px;"><a href="mailto:info@forbesdigitals.com" style="color: #007bff; text-decoration: none;">info@forbesdigitals.com</a></p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-right: 15px; vertical-align: top;">
                                <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;"><strong>Phone:</strong></p>
                              </td>
                              <td>
                                <p style="margin: 0 0 5px 0; font-size: 14px;"><a href="tel:+233547129636" style="color: #007bff; text-decoration: none;">+233 54 712 9636</a></p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #000000; color: #ffffff; text-align: center;">
                    <p style="margin: 0; font-size: 12px;">© 2020-${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Helper method to generate admin notification text
  private generateAdminOrderText(order: any): string {
    const items = order.items || [];
    const shippingAddress = order.shippingAddress || {};

    let text = `NEW ORDER RECEIVED!\n\n`;
    text += `Order Details:\n`;
    text += `${'-'.repeat(60)}\n`;
    text += `Order Number: ${order.orderNumber}\n`;
    text += `Order Date: ${new Date().toLocaleDateString()}\n`;
    text += `Status: ${order.status}\n\n`;
    
    text += `CUSTOMER INFORMATION:\n`;
    text += `Name: ${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}\n`;
    text += `Email: ${order.email}\n`;
    text += `Phone: ${shippingAddress.phone || 'Not provided'}\n\n`;
    
    text += `ORDER DETAILS:\n`;
    text += `Total Amount: GH₵${(order.totalCents / 100).toFixed(2)}\n`;
    text += `Delivery Method: ${order.deliveryMethod}\n`;
    text += `Payment Method: ${order.paymentMethod}\n\n`;
    
    text += `ITEMS:\n`;
    text += `${'-'.repeat(60)}\n`;
    items.forEach((item: any) => {
      text += `${item.title}\n`;
      text += `Qty: ${item.quantity} × GH₵${(item.priceCents / 100).toFixed(2)} = GH₵${((item.priceCents * item.quantity) / 100).toFixed(2)}\n\n`;
    });
    
    text += `${'-'.repeat(60)}\n`;
    text += `Subtotal: GH₵${(order.subtotalCents / 100).toFixed(2)}\n`;
    text += `Delivery: GH₵${(order.shippingCents / 100).toFixed(2)}\n`;
    text += `TOTAL: GH₵${(order.totalCents / 100).toFixed(2)}\n\n`;
    
    text += `DELIVERY ADDRESS:\n`;
    text += `${shippingAddress.address || ''}\n`;
    text += `${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}\n`;
    text += `${shippingAddress.country || ''}\n\n`;
    
    text += `Please process this order in the admin dashboard: ${process.env.ADMIN_URL || process.env.FRONTEND_URL}\n\n`;
    text += `© ${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.`;

    return text;
  }

  // Helper method to generate admin notification HTML
  private generateAdminOrderHTML(order: any): string {
    const items = order.items || [];
    const shippingAddress = order.shippingAddress || {};

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order - ${order.orderNumber}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f7f7;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #dc3545; padding: 30px 30px; text-align: center;">
                    <div style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 10px;">Forbes Digital Lifeline</div>
                    <div style="color: #ffcccc; font-size: 16px;">Admin Notification</div>
                    <h1 style="color: #ffffff; margin: 15px 0 0 0; font-size: 24px; font-weight: 600;">📦 New Order Received</h1>
                  </td>
                </tr>

                <!-- Alert Box -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px;">
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #856404; font-weight: 600;">⚠️ Action Required: New order needs to be processed</p>
                    </div>
                    <h2 style="margin: 0 0 5px 0; font-size: 22px; color: #dc3545;">Order #${order.orderNumber}</h2>
                    <p style="margin: 0; color: #666; font-size: 14px;">Received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                  </td>
                </tr>

                <!-- Customer Information -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">👤 Customer Information</h3>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="50%" style="padding: 5px 10px 5px 0; vertical-align: top;">
                            <strong style="color: #555;">Name:</strong><br>
                            <span style="color: #333;">${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}</span>
                          </td>
                          <td width="50%" style="padding: 5px 0 5px 10px; vertical-align: top;">
                            <strong style="color: #555;">Email:</strong><br>
                            <a href="mailto:${order.email}" style="color: #007bff; text-decoration: none;">${order.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 5px 10px 5px 0; vertical-align: top;">
                            <strong style="color: #555;"></strong>Phone:<br>
                            <a href="tel:${shippingAddress.phone}" style="color: #007bff; text-decoration: none;">${shippingAddress.phone || 'Not provided'}</a>
                          </td>
                          <td width="50%" style="padding: 5px 0 5px 10px; vertical-align: top;">
                            <strong style="color: #555;">Status:</strong><br>
                            <span style="background-color: #ffc107; color: #000; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${order.status}</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <div style="background-color: #e7f3ff; border-radius: 6px; padding: 20px;">
                      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #0056b3;">💰 Order Details</h3>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="50%" style="padding: 5px 10px 5px 0;">
                            <strong style="color: #555;">Total Amount:</strong><br>
                            <span style="font-size: 20px; color: #0056b3; font-weight: 700;">GH₵${(order.totalCents / 100).toFixed(2)}</span>
                          </td>
                          <td width="50%" style="padding: 5px 0 5px 10px;">
                            <strong style="color: #555;">Payment Method:</strong><br>
                            <span style="color: #333;">${order.deliveryMethod === 'delivery' ? 'Cash' : 'Cash/Momo'}</span>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style="padding: 5px 10px 5px 0;">
                            <strong style="color: #555;">Delivery Method:</strong><br>
                            <span style="color: #333; text-transform: capitalize;">${order.deliveryMethod}</span>
                          </td>
                          <td width="50%" style="padding: 5px 0 5px 10px;">
                            <strong style="color: #555; text-transform: capitalize;">${order.deliveryMethod} Fee:</strong><br>
                            <span style="color: #333;">GH₵${(order.shippingCents / 100).toFixed(2)}</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Order Items -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">📦 Order Items</h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="text-align: left; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Item</th>
                          <th style="text-align: center; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Qty</th>
                          <th style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Price</th>
                          <th style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-weight: 600;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${items.map((item: any) => `
                        <tr>
                          <td style="padding: 12px 15px; border: 1px solid #dee2e6;">${item.title || 'Unknown Item'}</td>
                          <td style="text-align: center; padding: 12px 15px; border: 1px solid #dee2e6;">${item.quantity || 0}</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${((item.priceCents || 0) / 100).toFixed(2)}</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${(((item.priceCents || 0) * (item.quantity || 0)) / 100).toFixed(2)}</td>
                        </tr>
                        `).join('')}
                      </tbody>
                      <tfoot style="background-color: #f8f9fa; font-weight: 600;">
                        <tr>
                          <td colspan="3" style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">Subtotal:</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${(order.subtotalCents / 100).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colspan="3" style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; text-transform: capitalize;">${order.deliveryMethod} Fee:</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6;">GH₵${(order.shippingCents / 100).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colspan="3" style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-size: 17px;">Total:</td>
                          <td style="text-align: right; padding: 12px 15px; border: 1px solid #dee2e6; font-size: 17px; color: #dc3545;">GH₵${(order.totalCents / 100).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">📍 Delivery Address</h3>
                      <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.8;">
                        ${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}<br>
                        ${shippingAddress.address || 'Address not available'}<br>
                        ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}<br>
                        ${shippingAddress.country || ''}<br>
                        <strong></strong> <a href="tel:${shippingAddress.phone}" style="color: #007bff; text-decoration: none;">${shippingAddress.phone || 'Not provided'}</a>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 30px 30px 30px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 4px; background-color: #dc3545;">
                          <a href="${process.env.ADMIN_URL || process.env.FRONTEND_URL}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Process Order in Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #000000; color: #ffffff; text-align: center;">
                    <p style="margin: 0; font-size: 12px;">© 2020-${new Date().getFullYear()} Forbes Digital Lifeline. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}