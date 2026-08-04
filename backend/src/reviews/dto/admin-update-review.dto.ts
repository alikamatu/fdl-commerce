import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class AdminUpdateReviewDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsArray()
  @IsOptional()
  images?: string[];
}
