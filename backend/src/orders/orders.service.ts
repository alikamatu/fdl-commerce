import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import axios from 'axios';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId?: string): Promise<Order> {
    const session = await this.orderModel.db.startSession();
    session.startTransaction();

    try {
      // Generate order number
      const orderCount = await this.orderModel.countDocuments();
      const orderNumber = `ORD-${(orderCount + 1).toString().padStart(6, '0')}`;

      // Validate products and check stock
      for (const item of createOrderDto.items) {
        const product = await this.productModel.findById(item.productId);
        
        if (!product) {
          throw new NotFoundException(`Product ${item.title} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.title}. Available: ${product.stock}`
          );
        }

        // Reserve stock by decrementing
        product.stock -= item.quantity;
        product.soldCount += item.quantity;
        await product.save({ session });
      }

      // Create order
      const orderData: any = {
        orderNumber,
        email: createOrderDto.email,
        items: createOrderDto.items,
        shippingAddress: createOrderDto.shippingAddress,
        subtotalCents: createOrderDto.subtotalCents,
        shippingCents: createOrderDto.shippingCents,
        taxCents: createOrderDto.taxCents,
        totalCents: createOrderDto.totalCents,
        paymentMethod: createOrderDto.paymentMethod || 'paystack',
        paymentCompleted: false, // Will be updated after payment verification
        status: 'pending',
      };

      if (userId) {
        orderData.userId = new Types.ObjectId(userId);
      }

      const order = new this.orderModel(orderData);
      await order.save({ session });

      await session.commitTransaction();

      const savedOrder = await this.orderModel.findById(order._id);
      if (!savedOrder) {
        throw new NotFoundException('Order not found after creation');
      }
      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async verifyPaystackPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Payment verification failed');
    }
  }

  async confirmPayment(
    orderId: string,
    paymentReference: string,
    paystackReference: string,
    userId?: string
  ): Promise<Order> {
    // Verify payment with Paystack
    const verificationResult = await this.verifyPaystackPayment(paymentReference);

    if (verificationResult.status !== true || verificationResult.data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    // Find order
    const query: any = { _id: orderId };
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if payment amount matches
    const paidAmount = verificationResult.data.amount; // In kobo/pesewas
    if (paidAmount !== order.totalCents) {
      throw new BadRequestException('Payment amount mismatch');
    }

    // Update order
    order.paymentCompleted = true;
    order.paymentId = paystackReference;
    order.status = 'confirmed';

    return order.save();
  }

  async findAll(userId?: string) {
    const query = userId ? { userId: new Types.ObjectId(userId) } : {};
    
    const orders = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return orders;
  }

  async findOne(id: string, userId?: string) {
    const query: any = { _id: id };
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string, userId?: string) {
    const query: any = { orderNumber };
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // async updateStatus(id: string, status: string) {
  //   const order = await this.orderModel.findById(id);

  //   if (!order) {
  //     throw new NotFoundException('Order not found');
  //   }

  //   order.status = status;

  //   if (status === 'shipped') {
  //     order.shippedAt = new Date();
  //   } else if (status === 'delivered') {
  //     order.deliveredAt = new Date();
  //   }

  //   return order.save();
  // }

  async getOrderStats() {
    const stats = await this.orderModel.aggregate([
      {
        $match: {
          paymentCompleted: true,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalCents' },
          averageOrderValue: { $avg: '$totalCents' }
        }
      }
    ]);

    return stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
  }

  // In orders.service.ts - update the updateStatus method to be more robust
async updateStatus(id: string, status: string): Promise<Order> {
  const order = await this.orderModel.findById(id);

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestException(`Invalid status: ${status}`);
  }

  order.status = status;

  // Update timestamps based on status changes
  if (status === 'shipped' && !order.shippedAt) {
    order.shippedAt = new Date();
  } else if (status === 'delivered' && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  return order.save();
}

  // Webhook handler for Paystack events
  async handlePaystackWebhook(event: any) {
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const metadata = event.data.metadata;

      // Find order by reference (you'll need to store this during order creation)
      const order = await this.orderModel.findOne({ 
        paymentId: reference 
      });

      if (order && !order.paymentCompleted) {
        order.paymentCompleted = true;
        order.status = 'confirmed';
        await order.save();
      }
    }
  }
}