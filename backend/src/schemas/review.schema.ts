import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // Changed to String to match how it's being saved
  @Prop({ type: String, required: true })
  productId: string;

  // Changed to String to match how it's being saved
  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: [] })
  images: string[];

  @Prop({ default: true })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  helpfulVotes: number;

  @Prop({ default: 0 })
  unhelpfulVotes: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  votedBy: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Add compound index to prevent duplicate reviews
ReviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
