import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  Req,
  BadRequestException,
  Headers,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RawBodyInterceptor } from './raw-body.interceptor';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Require authentication for order creation
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user._id;
    console.log('Creating order for userId:', userId);
    return this.ordersService.create(createOrderDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async findAllForAdmin(@Request() req) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    const orders = await this.ordersService.findAll(undefined, true);
    return {
      success: true,
      data: orders,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;
    const email = req.user.email;

    console.log('Fetching orders for userId:', userId, 'email:', email);

    // Fetch orders by userId AND email to include guest orders
    const orders = await this.ordersService.findAllByUserOrEmail(
      userId,
      email,
      isAdmin,
    );

    console.log('Found orders:', orders.length);

    return {
      success: true,
      data: orders,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    return this.ordersService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/overview')
  async getOrderStats(@Request() req) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    return this.ordersService.getOrderStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === 'admin';
    return this.ordersService.findOne(id, req.user._id, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('number/:orderNumber')
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @Request() req,
  ) {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?._id;
    return this.ordersService.findByOrderNumber(orderNumber, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notify-delivering')
  async sendShippingNotification(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    return this.ordersService.sendShippingNotification(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/initialize-paystack')
  async initializePaystackPayment(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findOne(id, req.user._id, false);

    if (order.paymentMethod !== 'paystack') {
      return {
        success: false,
        message: 'Order payment method is not Paystack',
      };
    }

    if (order.paymentCompleted) {
      return {
        success: false,
        message: 'Payment already completed for this order',
      };
    }

    const result = await this.ordersService.initializePaystackPayment(
      id,
      order.email,
      order.totalCents,
      {
        userId: req.user._id,
        userName: req.user.name,
        deliveryMethod: order.deliveryMethod,
      },
    );

    return {
      success: true,
      data: {
        authorizationUrl: result.authorizationUrl,
        reference: result.reference,
      },
    };
  }
  @Post('paystack/webhook')
  @UseInterceptors(RawBodyInterceptor) // You need to create this interceptor to get raw body
  async handlePaystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Req() request: any,
  ) {
    // Verify the webhook signature
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(request.rawBody)
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event;

    if (event === 'charge.success') {
      const reference = body.data.reference;

      // Complete the payment
      await this.ordersService.completePaystackPayment(
        reference,
        undefined,
        true,
      );

      return { success: true, message: 'Payment completed successfully' };
    }

    return { success: true, message: 'Webhook received' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('paystack/verify')
  async verifyPaystackPayment(
    @Body() body: { reference: string },
    @Request() req,
  ) {
    try {
      const order = await this.ordersService.completePaystackPayment(
        body.reference,
        req.user._id,
        req.user.role === 'admin',
      );

      return {
        success: true,
        data: order,
        message: 'Payment verified and completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Payment verification failed',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment-method')
  async updatePaymentMethod(
    @Param('id') id: string,
    @Body() body: { paymentMethod: string },
    @Request() req,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    return this.ordersService.updatePaymentMethod(id, body.paymentMethod);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notify-pickup')
  async sendPickupNotification(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    return this.ordersService.sendPickupNotification(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notify-delivered')
  async sendDeliveredNotification(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    return this.ordersService.sendDeliveredNotification(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;

    return this.ordersService.cancelOrder(id, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async adminDeleteOrder(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    await this.ordersService.adminDelete(id);
    return {
      success: true,
      message: 'Order permanently deleted',
    };
  }
}
