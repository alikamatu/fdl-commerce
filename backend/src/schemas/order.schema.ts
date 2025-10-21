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

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true, default: 'US' })
  country: string;

  @Prop({ required: true })
  phone: string;
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

  @Prop({ type: [String], required: true })
  phone: string[];

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
    required: true, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Prop({ 
    required: true,
    enum: ['credit_card', 'paypal', 'stripe', 'paystack'],
    default: 'credit_card'
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
}

export const OrderSchema = SchemaFactory.createForClass(Order);