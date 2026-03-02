import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CategoriesService } from './categories.service';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('categories')
@Controller('api')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new category with optional image' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category slug already exists' })
  async create(
    @Body() body: { name: string; slug: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (image) {
      const uploadResult = await this.fileUploadService.uploadImage(image);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const category = await this.categoriesService.create(
      body.name,
      body.slug,
      imageUrl,
      imagePublicId,
    );

    return {
      success: true,
      data: category,
      message: 'Category created successfully',
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return {
      success: true,
      data: categories,
    };
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      success: true,
      data: category,
    };
  }

  @Get('categories/slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return {
      success: true,
      data: category,
    };
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a category with optional image' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category slug already exists' })
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; slug: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (image) {
      const uploadResult = await this.fileUploadService.uploadImage(image);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const category = await this.categoriesService.update(
      id,
      body.name,
      body.slug,
      imageUrl,
      imagePublicId,
    );

    return {
      success: true,
      data: category,
      message: 'Category updated successfully',
    };
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (soft delete)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
