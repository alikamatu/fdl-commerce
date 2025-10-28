import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  Param, 
  UseGuards, 
  Request,
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

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
      data: orders
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
    const orders = await this.ordersService.findAllByUserOrEmail(userId, email, isAdmin);
    
    console.log('Found orders:', orders.length);
    
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
  async findByOrderNumber(@Param('orderNumber') orderNumber: string, @Request() req) {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?._id;
    return this.ordersService.findByOrderNumber(orderNumber, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;
    
    return this.ordersService.cancelOrder(id, userId, isAdmin);
  }
}