import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  priceCents: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  brand: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class ShippingAddress {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: false })
  zipCode: string;

  @Prop({ required: true, default: 'GH' })
  country: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  pickupLocation?: string; // For pickup orders
}

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: true })
  subtotalCents: number;

  @Prop({ required: true, default: 0 })
  shippingCents: number;

  @Prop({ required: true, default: 0 })
  taxCents: number;

  @Prop({ required: true })
  totalCents: number;

    @Prop({ 
    type: String, 
    enum: ['delivery', 'pickup'], 
    default: 'delivery' 
  })
  deliveryMethod: string;

@Prop({ 
  required: true, 
  enum: ['pending_payment', 'pending', 'confirmed', 'processing', 'delivering', 'available', 'delivered', 'cancelled'],
  default: 'confirmed'
})
status: string;

  @Prop({ 
  required: true,
  enum: ['cash', 'bank_transfer', 'mobile_money', 'cash_or_momo', 'paystack', 'cash_on_delivery', 'cash_on_pickup', 'bank_card'],
  default: 'mobile_money'
})
paymentMethod: string;


  @Prop({ default: false })
  paymentCompleted: boolean;

  @Prop()
  paymentId?: string;

  @Prop()
  trackingNumber?: string;

  @Prop()
  shippedAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  estimatedDelivery?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);