import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class BlogImage {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  alt: string;

  @Prop({ required: true })
  publicId: string;
}

export const BlogImageSchema = SchemaFactory.createForClass(BlogImage);

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop({ type: BlogImageSchema })
  featuredImage: BlogImage;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop({ default: 0 })
  readingTime: number;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  publishedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);