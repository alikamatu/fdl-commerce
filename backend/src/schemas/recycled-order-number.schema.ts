import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecycledOrderNumberDocument = RecycledOrderNumber & Document;

@Schema({ timestamps: true })
export class RecycledOrderNumber {
  @Prop({ required: true, unique: true, index: true })
  seq: number;
}

export const RecycledOrderNumberSchema = SchemaFactory.createForClass(RecycledOrderNumber);
