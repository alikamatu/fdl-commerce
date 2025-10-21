import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  Param, 
  UseGuards, 
  Request,
  Headers,
  RawBodyRequest,
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import * as crypto from 'crypto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @Body() body: { paymentReference: string; paystackReference: string },
    @Request() req
  ) {
    return this.ordersService.confirmPayment(
      id,
      body.paymentReference,
      body.paystackReference,
      req.user._id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async findAllForAdmin(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }
    
    const orders = await this.ordersService.findAll(undefined, true);
    return {
      success: true,
      data: orders
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const isAdmin = req.user.role === 'admin';
    const orders = await this.ordersService.findAll(req.user._id, isAdmin);
    return {
      success: true,
      data: orders
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req
  ) {
    // Only admins should be able to update status
    if (req.user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }
    
    return this.ordersService.updateStatus(id, body.status);
  }


  @UseGuards(JwtAuthGuard)
  @Get('stats/overview')
  async getOrderStats(@Request() req) {
    // Only admin should access this
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

  @Get('number/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string, @Request() req) {
    // This endpoint should probably also check authentication
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?._id;
    return this.ordersService.findByOrderNumber(orderNumber, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.updateStatus(id, 'cancelled');
  }


  // Paystack webhook endpoint
  @Post('webhook/paystack')
  async handlePaystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any
  ) {
    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    }
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      return { status: 'error', message: 'Invalid signature' };
    }

    // Process the webhook
    await this.ordersService.handlePaystackWebhook(body);

    return { status: 'success' };
  }
}