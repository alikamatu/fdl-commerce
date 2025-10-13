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

  @Post('guest')
  async createGuestOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // FIXED: Separate authenticated and guest payment confirmation routes
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

  @Patch('guest/:id/confirm-payment')
  async confirmGuestPayment(
    @Param('id') id: string,
    @Body() body: { paymentReference: string; paystackReference: string }
  ) {
    return this.ordersService.confirmPayment(
      id,
      body.paymentReference,
      body.paystackReference
    );
  }

  // FIXED: Add response structure wrapper
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const orders = await this.ordersService.findAll(req.user._id);
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
    return this.ordersService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/overview')
  async getOrderStats(@Request() req) {
    // Only admin should access this in real app
    return this.ordersService.getOrderStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id, req.user._id);
  }

  @Get('number/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  // FIXED: Add cancel order endpoint
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