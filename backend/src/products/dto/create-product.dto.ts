import { IsString, IsNumber, IsArray, IsNotEmpty, IsOptional, Min, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  alt: string;

  @IsNumber()
  @Min(0)
  position: number;
}

export class ProductSpecificationDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  priceCents: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsArray()
  @Type(() => ProductSpecificationDto)
  specifications: ProductSpecificationDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}