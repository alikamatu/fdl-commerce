import { IsString, IsArray, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  excerpt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  featuredImage?: {
    url: string;
    alt: string;
    publicId: string;
  };

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string;
}