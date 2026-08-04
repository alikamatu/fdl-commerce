import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Review> {
    try {
      const order = await this.orderModel.findOne({
        _id: new Types.ObjectId(createReviewDto.orderId),
        userId: new Types.ObjectId(userId),
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'delivered') {
        throw new BadRequestException(
          'You can only review products from delivered orders',
        );
      }

      const productInOrder = order.items.find(
        (item) => item.productId === createReviewDto.productId,
      );

      if (!productInOrder) {
        throw new BadRequestException('Product not found in this order');
      }

      const existingReview = await this.reviewModel.findOne({
        userId: new Types.ObjectId(userId),
        productId: createReviewDto.productId,
        orderId: createReviewDto.orderId,
      });

      if (existingReview) {
        throw new BadRequestException(
          'You have already reviewed this product from this order',
        );
      }

      const product = await this.productModel.findById(
        createReviewDto.productId,
      );
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Create review
      const review = new this.reviewModel({
        ...createReviewDto,
        userId: new Types.ObjectId(userId),
        isVerified: true,
      });

      await review.save();
      console.log('✓ Review created:', review._id);

      // Update product rating stats immediately
      await this.updateProductRatingStats(createReviewDto.productId);
      console.log(
        '✓ Product rating stats updated for:',
        createReviewDto.productId,
      );

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async findAllForProduct(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: any[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({
          productId: productId,
          isActive: true,
        })
        .populate('userId', 'displayName email')
        .sort({ createdAt: -1, helpfulVotes: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.reviewModel.countDocuments({
        productId: productId,
        isActive: true,
      }),
    ]);

    // Transform to ensure user field exists
    const transformedReviews = reviews.map((review) => ({
      ...review,
      user: review.userId
        ? {
            displayName:
              (review.userId as any).displayName ||
              (review.userId as any).email?.split('@')[0] ||
              'Anonymous User',
          }
        : {
            displayName: 'Anonymous User',
          },
    }));

    return {
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate('userId', 'displayName')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<Review> {
    try {
      const review = await this.reviewModel.findById(id);

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (review.userId.toString() !== userId) {
        throw new ForbiddenException('You can only update your own reviews');
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (review.createdAt < twentyFourHoursAgo) {
        throw new BadRequestException(
          'You can only edit reviews within 24 hours of posting',
        );
      }

      Object.assign(review, updateReviewDto);
      await review.save();

      if (updateReviewDto.rating && updateReviewDto.rating !== review.rating) {
        await this.updateProductRatingStats(review.productId);
      }

      return review;
    } catch (error) {
      throw error;
    }
  }

  async remove(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      const review = await this.reviewModel.findById(id);

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (!isAdmin && review.userId.toString() !== userId) {
        throw new ForbiddenException('You can only delete your own reviews');
      }

      const productId = review.productId;

      review.isActive = false;
      await review.save();

      await this.updateProductRatingStats(productId);
    } catch (error) {
      throw error;
    }
  }

  async voteHelpful(id: string, userId: string): Promise<Review> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const userIdObj = new Types.ObjectId(userId);

    if (review.votedBy.includes(userIdObj)) {
      throw new BadRequestException('You have already voted on this review');
    }

    review.helpfulVotes += 1;
    review.votedBy.push(userIdObj);

    return review.save();
  }

  // Add to reviews.service.ts

  async findAllForAdmin(filters: {
    page: number;
    limit: number;
    rating?: string;
    isActive?: string;
    isVerified?: string;
    search?: string;
  }) {
    const { page, limit, rating, isActive, isVerified, search } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .populate('userId', 'displayName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.reviewModel.countDocuments(query),
    ]);

    // Get product details for each review
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review: any) => {
        try {
          const product = await this.productModel
            .findById(review.productId)
            .lean();
          return {
            ...review,
            product: product
              ? {
                  title: product.title,
                  images: product.images || [],
                }
              : null,
          };
        } catch (error) {
          return {
            ...review,
            product: null,
          };
        }
      }),
    );

    return {
      reviews: reviewsWithProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async adminToggleActive(id: string, isActive?: boolean): Promise<Review> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.isActive = isActive !== undefined ? isActive : !review.isActive;
    await review.save();

    return review;
  }

  async adminUpdate(
    id: string,
    updateDto: { title?: string; comment?: string; rating?: number; images?: string[] },
  ): Promise<Review> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const previousRating = review.rating;

    if (updateDto.title !== undefined) {
      review.title = updateDto.title;
    }
    if (updateDto.comment !== undefined) {
      review.comment = updateDto.comment;
    }
    if (updateDto.rating !== undefined) {
      review.rating = updateDto.rating;
    }
    if (updateDto.images !== undefined) {
      review.images = updateDto.images;
    }

    await review.save();

    // Recalculate product rating stats if rating changed
    if (updateDto.rating !== undefined && updateDto.rating !== previousRating) {
      await this.updateProductRatingStats(review.productId);
    }

    return review;
  }

  async adminRemove(id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Review not found');
    }

    // Update product rating stats after deletion
    await this.updateProductRatingStats(result.productId);
  }

  async voteUnhelpful(id: string, userId: string): Promise<Review> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const userIdObj = new Types.ObjectId(userId);

    if (review.votedBy.includes(userIdObj)) {
      throw new BadRequestException('You have already voted on this review');
    }

    review.unhelpfulVotes += 1;
    review.votedBy.push(userIdObj);

    return review.save();
  }

  async getProductReviewStats(productId: string) {
    console.log('Getting stats for product:', productId);

    const stats = await this.reviewModel.aggregate([
      {
        $match: {
          productId: productId,
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    console.log('Stats result:', stats);

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach((rating: number) => {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution,
    };
  }

  async getUserReviewableProducts(userId: string) {
    const deliveredOrders = await this.orderModel.find({
      userId: new Types.ObjectId(userId),
      status: 'delivered',
    });

    type ReviewableProduct = {
      productId: string;
      productTitle: string;
      productImage: string;
      orderId: string;
      orderNumber: string;
      purchasedDate: Date;
    };

    const reviewableProducts: ReviewableProduct[] = [];

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const existingReview = await this.reviewModel.findOne({
          userId: new Types.ObjectId(userId),
          productId: item.productId,
          orderId: (order._id as Types.ObjectId).toString(),
        });

        if (!existingReview) {
          const product = await this.productModel.findById(item.productId);
          if (product) {
            reviewableProducts.push({
              productId: product.id.toString(),
              productTitle: product.title,
              productImage: product.images[0]?.url,
              orderId: (order._id as Types.ObjectId).toString(),
              orderNumber: order.orderNumber,
              purchasedDate: order.deliveredAt || (order as any).updatedAt,
            });
          }
        }
      }
    }

    return reviewableProducts;
  }

  private async updateProductRatingStats(productId: string) {
    try {
      console.log(`Updating rating stats for product: ${productId}`);

      // Use string matching for productId
      const stats = await this.reviewModel.aggregate([
        {
          $match: {
            productId: productId, // String match
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ]);

      console.log('Aggregation result:', stats);

      if (stats.length > 0) {
        const avgRating = Math.round(stats[0].averageRating * 10) / 10;
        const count = stats[0].reviewCount;

        console.log(
          `Setting averageRating: ${avgRating}, reviewCount: ${count}`,
        );

        const updateResult = await this.productModel.updateOne(
          { _id: productId },
          {
            $set: {
              averageRating: avgRating,
              reviewCount: count,
            },
          },
        );

        console.log('Update result:', updateResult);

        if (updateResult.matchedCount === 0) {
          console.error(`Product ${productId} not found!`);
        } else if (updateResult.modifiedCount === 0) {
          console.warn(
            `Product ${productId} found but not modified (values may be the same)`,
          );
        } else {
          console.log(`✓ Successfully updated product ${productId}`);
        }
      } else {
        console.log('No active reviews found, setting to 0');
        await this.productModel.updateOne(
          { _id: productId },
          {
            $set: {
              averageRating: 0,
              reviewCount: 0,
            },
          },
        );
      }
    } catch (error) {
      console.error('Error updating product rating stats:', error);
      throw error;
    }
  }

  // Admin function to sync all product ratings
  async syncAllProductRatings() {
    const productIds = await this.reviewModel.distinct('productId');
    console.log(`Syncing ratings for ${productIds.length} products...`);

    for (const productId of productIds) {
      try {
        await this.updateProductRatingStats(productId);
      } catch (error) {
        console.error(`Failed to update product ${productId}:`, error.message);
      }
    }

    console.log('Rating sync complete!');
  }
}
