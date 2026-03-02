import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class ProductImage {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  alt: string;

  @Prop({ required: true })
  position: number;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

@Schema()
export class ProductSpecification {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

export const ProductSpecificationSchema =
  SchemaFactory.createForClass(ProductSpecification);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  priceCents: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: [ProductImageSchema], default: [] })
  images: ProductImage[];

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ required: true })
  brand: string;

  @Prop({ type: [ProductSpecificationSchema], default: [] })
  specifications: ProductSpecification[];

  @Prop({ default: true })
  isActive: boolean;

  // New fields for deals and discounts
  @Prop({ default: null })
  originalPriceCents?: number;

  @Prop({ default: 0 })
  discountPercent: number;

  @Prop({ default: false })
  isDeal: boolean;

  @Prop({ default: null })
  dealExpiresAt?: Date;

  @Prop({
    default: 0,
    validate: {
      validator: function (v: number) {
        return v >= 0;
      },
      message: 'soldCount cannot be negative',
    },
  })
  soldCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
