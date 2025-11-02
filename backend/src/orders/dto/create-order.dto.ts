import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  priceCents: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  brand: string;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  zipCode: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  pickupLocation?: string; // For pickup orders
}

export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['cash', 'bank_transfer', 'mobile_money', 'cash_or_momo'])
  paymentMethod: string;

  @IsNumber()
  @IsNotEmpty()
  subtotalCents: number;

  @IsNumber()
  @IsNotEmpty()
  shippingCents: number;

  @IsNumber()
  @IsOptional()
  taxCents: number;

  @IsNumber()
  @IsNotEmpty()
  totalCents: number;

  @IsString()
  @IsOptional()
  deliveryMethod?: 'delivery' | 'pickup';
}