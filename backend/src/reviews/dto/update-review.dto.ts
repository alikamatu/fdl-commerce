import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export class ReviewResponseDto {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isActive: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  votedBy: string[];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
  };
}