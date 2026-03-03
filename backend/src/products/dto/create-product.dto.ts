import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsOptional,
  Min,
  IsBoolean,
  IsMongoId,
  Max,
  IsDate,
  IsUrl,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Alt text cannot exceed 200 characters' })
  alt: string;

  @IsNumber()
  @Min(0)
  position: number;
}

export class ProductSpecificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Specification key cannot exceed 100 characters' })
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500, {
    message: 'Specification value cannot exceed 500 characters',
  })
  value: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'SKU must be at least 3 characters long' })
  @MaxLength(50, { message: 'SKU cannot exceed 50 characters' })
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description: string;

  @IsNumber()
  @Min(1, { message: 'Price must be at least $0.01' })
  @Max(10000000, { message: 'Price cannot exceed $100,000' })
  priceCents: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 images' })
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Brand name cannot exceed 100 characters' })
  brand: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications: ProductSpecificationDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPriceCents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isDeal?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dealExpiresAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  soldCount?: number;
}
