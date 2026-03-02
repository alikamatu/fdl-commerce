import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    const review = await this.reviewsService.create(
      createReviewDto,
      req.user._id,
    );
    return {
      success: true,
      data: review,
      message: 'Review submitted successfully',
    };
  }

  @Get('product/:productId')
  async findAllForProduct(
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.reviewsService.findAllForProduct(
      productId,
      page,
      limit,
    );
    return {
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  async findAllByUser(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.reviewsService.findAllByUser(
      req.user._id,
      page,
      limit,
    );
    return {
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const review = await this.reviewsService.findOne(id);
    return {
      success: true,
      data: review,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    const review = await this.reviewsService.update(
      id,
      updateReviewDto,
      req.user._id,
    );
    return {
      success: true,
      data: review,
      message: 'Review updated successfully',
    };
  }

  @Get('sync-all-ratings')
  async syncAllProductRatings() {
    await this.reviewsService.syncAllProductRatings();
    return {
      success: true,
      message: 'All product ratings have been synced',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === 'admin';
    await this.reviewsService.remove(id, req.user._id, isAdmin);
    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  // Add to reviews.controller.ts

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async findAllForAdmin(
    @Request() req?: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('rating') rating?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
    @Query('search') search?: string,
  ) {
    // Check admin permissions
    if (req?.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    const result = await this.reviewsService.findAllForAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      rating,
      isActive,
      isVerified,
      search,
    });

    return {
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  async adminUpdateReview(
    @Param('id') id: string,
    @Body() body: { action: 'toggle' | 'delete'; isActive?: boolean },
    @Request() req,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    if (body.action === 'delete') {
      await this.reviewsService.adminRemove(id);
      return {
        success: true,
        message: 'Review deleted successfully',
      };
    } else {
      const review = await this.reviewsService.adminToggleActive(
        id,
        body.isActive,
      );
      return {
        success: true,
        data: review,
        message: `Review ${body.isActive ? 'activated' : 'deactivated'} successfully`,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async adminDeleteReview(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    await this.reviewsService.adminRemove(id);
    return {
      success: true,
      message: 'Review permanently deleted',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/helpful')
  async voteHelpful(@Param('id') id: string, @Request() req) {
    const review = await this.reviewsService.voteHelpful(id, req.user._id);
    return {
      success: true,
      data: review,
      message: 'Thank you for your feedback',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unhelpful')
  async voteUnhelpful(@Param('id') id: string, @Request() req) {
    const review = await this.reviewsService.voteUnhelpful(id, req.user._id);
    return {
      success: true,
      data: review,
      message: 'Thank you for your feedback',
    };
  }

  @Get('product/:productId/stats')
  async getProductReviewStats(@Param('productId') productId: string) {
    const stats = await this.reviewsService.getProductReviewStats(productId);
    return {
      success: true,
      data: stats,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/reviewable-products')
  async getUserReviewableProducts(@Request() req) {
    const products = await this.reviewsService.getUserReviewableProducts(
      req.user._id,
    );
    return {
      success: true,
      data: products,
    };
  }
}
