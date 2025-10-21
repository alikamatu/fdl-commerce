import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  Param, 
  UseGuards, 
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user._id);
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
}