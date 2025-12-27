import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { EmailService } from '../email/email.service';
import { PaystackService } from '../paystack/paystack.service';
import { PaystackTransaction } from '../paystack/paystack.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly emailService: EmailService,
    private readonly paystackService: PaystackService,
  ) {}

  async verifyPaystackPayment(reference: string): Promise<any> {
    try {
      const verificationResult = await this.paystackService.verifyTransaction(reference);
      
      if (!verificationResult.status || verificationResult.data.status !== 'success') {
        throw new BadRequestException('Payment verification failed or payment not successful');
      }

      return {
        success: true,
        data: {
          amount: verificationResult.data.amount,
          currency: verificationResult.data.currency,
          paidAt: verificationResult.data.paid_at,
          reference: verificationResult.data.reference,
          channel: verificationResult.data.channel,
          metadata: verificationResult.data.metadata,
        },
      };
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw new BadRequestException('Payment verification failed');
    }
  }
  async findAll(userId?: string, includeAll: boolean = false) {
    let query = {};
    
    if (!includeAll && userId) {
      query = { userId: new Types.ObjectId(userId) };
    }
    
    const orders = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return orders;
  }

    async initializePaystackPayment(
    orderId: string,
    email: string,
    amountCents: number,
    metadata?: any
  ): Promise<{ authorizationUrl: string; reference: string }> {
    const order = await this.orderModel.findById(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentMethod !== 'paystack') {
      throw new BadRequestException('Order payment method is not Paystack');
    }

    const reference = this.paystackService.generateReference();
    
    // Convert amount to smallest unit (pesewas for GHS)
    const amountInPesewas = this.paystackService.convertToSmallestUnit(amountCents / 100, 'GHS');
    
    const transaction: PaystackTransaction = {
      reference,
      amount: amountInPesewas,
      email,
      currency: 'GHS',
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        userId: order.userId?.toString(),
        ...metadata,
      },
    };

    const response = await this.paystackService.initializeTransaction(transaction);
    
    // Update order with payment reference
    order.paymentId = reference;
    await order.save();

    return {
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
    };
  }

  // New method to find orders by userId OR email (includes legacy guest orders)
  async findAllByUserOrEmail(userId: string, email: string, includeAll: boolean = false) {
    let query = {};
    
    if (!includeAll) {
      // Find orders where userId matches OR email matches (for guest orders)
      query = {
        $or: [
          { userId: new Types.ObjectId(userId) },
          { email: email, userId: { $exists: false } } // Guest orders with same email
        ]
      };
    }
    
    const orders = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    console.log('Query:', JSON.stringify(query));
    console.log('Found orders:', orders.length);

    return orders;
  }
  

  async confirmPayment(
    orderId: string,
    paymentReference: string,
    paystackReference: string,
    userId?: string
  ): Promise<Order> {
    const verificationResult = await this.verifyPaystackPayment(paymentReference);

    if (verificationResult.status !== true || verificationResult.data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    const query: any = { _id: orderId };
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const paidAmount = verificationResult.data.amount;
    if (paidAmount !== order.totalCents) {
      throw new BadRequestException('Payment amount mismatch');
    }

    order.paymentCompleted = true;
    order.paymentId = paystackReference;
    order.status = 'confirmed';

    return order.save();
  }

  async sendShippingNotification(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.orderModel.findById(id);
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check for both 'delivering' and 'available' statuses
      if (!['delivering', 'available'].includes(order.status)) {
        throw new BadRequestException(`Order status must be 'delivering' or 'available'. Current status: ${order.status}`);
      }

      // Create fullName from firstName and lastName
      const fullName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

      // Determine the correct email type based on order status
      let emailType = 'delivering';
      if (order.status === 'available') {
        emailType = 'available';
      }

      // Pass complete order details like confirmation email
      await this.emailService.sendShippingNotificationEmail(
        order.email,
        fullName,
        order.orderNumber,
        {
          items: order.items,
          subtotalCents: order.subtotalCents,
          shippingCents: order.shippingCents,
          taxCents: order.taxCents,
          totalCents: order.totalCents,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          email: order.email,
          emailType: emailType  // Pass the email type
        }
      );

      return {
        success: true,
        message: 'Shipping notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending shipping notification:', error);
      throw error;
    }
  }

  async sendPickupNotification(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.orderModel.findById(id);
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'available') {
        throw new BadRequestException('Order is not available for pickup');
      }

      // Create fullName from firstName and lastName
      const fullName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

      // Pass complete order details like confirmation email with 'available' type
      await this.emailService.sendShippingNotificationEmail(
        order.email,
        fullName,
        order.orderNumber,
        {
          items: order.items,
          subtotalCents: order.subtotalCents,
          shippingCents: order.shippingCents,
          taxCents: order.taxCents,
          totalCents: order.totalCents,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          email: order.email,
          pickupLocation: order.shippingAddress.pickupLocation,
          emailType: 'available'  // Specify this is for pickup/available
        }
      );

      return {
        success: true,
        message: 'Pickup notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending pickup notification:', error);
      throw error;
    }
  }

  async sendDeliveredNotification(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.orderModel.findById(id);
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'delivered') {
        throw new BadRequestException('Order is not delivered');
      }

      // Create fullName from firstName and lastName
      const fullName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

      // Pass complete order details like confirmation email
      await this.emailService.sendDeliveredNotificationEmail(
        order.email,
        fullName,
        order.orderNumber,
        {
          items: order.items,
          subtotalCents: order.subtotalCents,
          shippingCents: order.shippingCents,
          taxCents: order.taxCents,
          totalCents: order.totalCents,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          email: order.email
        }
      );

      return {
        success: true,
        message: 'Delivered notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending delivered notification:', error);
      throw error;
    }
  }

 async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
  if (!userId) {
    throw new BadRequestException('User authentication required to place order');
  }

  const session = await this.orderModel.db.startSession();
  session.startTransaction();

  let savedOrder: Order | null = null;

  try {
    // 1️⃣ Generate order number
    const orderCount = await this.orderModel.countDocuments().session(session);
    const orderNumber = `ORD-${(orderCount + 1).toString().padStart(6, '0')}`;

    // 2️⃣ Validate stock & update products
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findById(item.productId).session(session);

      if (!product) {
        throw new NotFoundException(`Product ${item.title} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.title}. Available: ${product.stock}`,
        );
      }

      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save({ session });
    }

    // 3️⃣ Determine initial payment + order status
    let status: string;
    let paymentCompleted = false;

    switch (createOrderDto.paymentMethod) {
      case 'paystack':
        status = 'pending_payment';
        paymentCompleted = false;
        break;

      case 'cash_on_delivery':
      case 'cash_on_pickup':
        status = 'confirmed';
        paymentCompleted = false;
        break;

      default:
        status = 'confirmed';
        paymentCompleted = false;
        break;
    }

    // 4️⃣ Create order
    const order = new this.orderModel({
      orderNumber,
      userId: new Types.ObjectId(userId),
      email: createOrderDto.email,
      items: createOrderDto.items,
      shippingAddress: createOrderDto.shippingAddress,
      deliveryMethod: createOrderDto.deliveryMethod || 'delivery',
      subtotalCents: createOrderDto.subtotalCents,
      shippingCents: createOrderDto.shippingCents,
      taxCents: createOrderDto.taxCents || 0,
      totalCents: createOrderDto.totalCents,
      paymentMethod: createOrderDto.paymentMethod,
      paymentCompleted,
      status,
    });

    await order.save({ session });

    // 5️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 6️⃣ Reload saved order (clean instance)
    savedOrder = await this.orderModel.findById(order._id);

    if (!savedOrder) {
      throw new NotFoundException('Order not found after creation');
    }

    console.log('Order created successfully:', savedOrder.orderNumber);

    // 7️⃣ Send order confirmation email (ALL orders)
    try {
      const fullName = `${savedOrder.shippingAddress.firstName} ${savedOrder.shippingAddress.lastName}`;

      await this.emailService.sendOrderConfirmationEmail(
        savedOrder.email,
        fullName,
        savedOrder.orderNumber,
        {
          items: savedOrder.items,
          subtotalCents: savedOrder.subtotalCents,
          shippingCents: savedOrder.shippingCents,
          taxCents: savedOrder.taxCents,
          totalCents: savedOrder.totalCents,
          paymentMethod: savedOrder.paymentMethod,
          deliveryMethod: savedOrder.deliveryMethod,
          shippingAddress: savedOrder.shippingAddress,
          paymentStatus: savedOrder.paymentCompleted ? 'paid' : 'pending',
        },
      );
    } catch (emailError) {
      console.error(
        'Failed to send order confirmation email:',
        emailError.message,
      );
      // ❗ Never fail order creation because of email
    }

    // 8️⃣ Send new order notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await this.emailService.sendNewOrderNotificationToAdmin(savedOrder, adminEmail);
      } else {
        console.warn('ADMIN_EMAIL not set, skipping admin notification');
      }
    } catch (emailError) {
      console.error(
        'Failed to send admin notification email:',
        emailError.message,
      );
      // ❗ Never fail order creation because of email
    }

    return savedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}


  async completePaystackPayment(
  reference: string,
  userId?: string,
  isAdmin: boolean = false
): Promise<Order> {
  try {
    // Verify payment with Paystack
    const verificationResult = await this.paystackService.verifyTransaction(reference);

    if (!verificationResult.status || verificationResult.data.status !== 'success') {
      throw new BadRequestException('Payment verification failed or payment not successful');
    }

    // Extract orderId from metadata
    const orderId = verificationResult.data.metadata?.orderId;
    
    if (!orderId) {
      throw new BadRequestException('Order ID not found in payment metadata');
    }

    // Find order by ID (not by paymentId reference)
    const query: any = { _id: orderId };
    if (!isAdmin && userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify amount matches (Paystack returns amount in pesewas)
    const expectedAmount = Math.round(order.totalCents); // Already in pesewas
    const paidAmount = verificationResult.data.amount;

    if (Math.abs(paidAmount - expectedAmount) > 1) { // Allow 1 pesewa difference for rounding
      console.error('Amount mismatch:', { expected: expectedAmount, paid: paidAmount });
      throw new BadRequestException('Payment amount mismatch');
    }

    // Update order
    order.paymentCompleted = true;
    order.status = 'confirmed';
    order.paymentId = reference;

    const updatedOrder = await order.save();

    return updatedOrder;
  } catch (error) {
    console.error('Paystack payment completion error:', error);
    throw error;
  }
}

  async findOne(id: string, userId?: string, isAdmin: boolean = false) {
    const query: any = { _id: id };
    
    if (!isAdmin && userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findById(id: string, userId?: string, isAdmin: boolean = false) {
    const query: any = { _id: id };
    
    if (!isAdmin && userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string, userId?: string, isAdmin: boolean = false) {
    const query: any = { orderNumber };
    if (!isAdmin && userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

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

 async updateStatus(id: string, status: string): Promise<Order> {
  const order = await this.orderModel.findById(id);

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Validate status
  const validStatuses = ['pending_payment', 'pending', 'confirmed', 'processing', 'delivering', 'available', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestException(`Invalid status: ${status}`);
  }

  console.log(`Updating order ${id} from ${order.status} to ${status}`);

  // Handle cancellation - restore stock and decrease soldCount
  if (status === 'cancelled' && order.status !== 'cancelled') {
    console.log('Order is being cancelled, restoring product stock and soldCount...');
    
    for (const item of order.items) {
      const product = await this.productModel.findById(item.productId);
      if (product) {
        console.log(`Updating product ${product.title}: stock +${item.quantity}, soldCount -${item.quantity}`);
        
        // Use atomic update to ensure consistency
        await this.productModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: { 
              stock: item.quantity,
              soldCount: -item.quantity
            }
          }
        );
      }
    }
  }

  // Handle status change from cancelled to another status (un-cancellation)
  if (order.status === 'cancelled' && status !== 'cancelled') {
    console.log('Order is being un-cancelled, updating product stock and soldCount...');
    
    for (const item of order.items) {
      const product = await this.productModel.findById(item.productId);
      if (product) {
        console.log(`Updating product ${product.title}: stock -${item.quantity}, soldCount +${item.quantity}`);
        
        await this.productModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: { 
              stock: -item.quantity,
              soldCount: item.quantity
            }
          }
        );
      }
    }
  }

  order.status = status;

  // Update timestamps based on status changes
  if (status === 'delivering' || (status === 'available' && !order.shippedAt)) {
    order.shippedAt = new Date();
  } else if (status === 'delivered' && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  const updatedOrder = await order.save();
  console.log('Order updated successfully:', updatedOrder._id);
  
  return updatedOrder;
}

  async updatePaymentMethod(id: string, paymentMethod: string): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'bank_transfer', 'mobile_money', 'cash_or_momo', 'paystack', 'cash_on_delivery', 'cash_on_pickup', 'bank_card'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      throw new BadRequestException(`Invalid payment method: ${paymentMethod}`);
    }

    console.log(`Updating order ${id} payment method from ${order.paymentMethod} to ${paymentMethod}`);

    order.paymentMethod = paymentMethod;

    const updatedOrder = await order.save();
    console.log('Order payment method updated successfully:', updatedOrder._id);
    
    return updatedOrder;
  }

async cancelOrder(id: string, userId?: string, isAdmin: boolean = false): Promise<Order> {
  const query: any = { _id: id };
  
  if (!isAdmin && userId) {
    query.userId = new Types.ObjectId(userId);
  }

  const order = await this.orderModel.findOne(query);

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (!['pending_payment', 'pending', 'confirmed'].includes(order.status)) {
    throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
  }

  // Use atomic updates for products
  for (const item of order.items) {
    await this.productModel.findByIdAndUpdate(
      item.productId,
      {
        $inc: { 
          stock: item.quantity,
          soldCount: -item.quantity
        }
      }
    );
  }

  order.status = 'cancelled';
  return order.save();
}
}