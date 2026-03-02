import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@ApiTags('blogs')
@Controller('api')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post('admin/blogs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog created successfully' })
  @ApiResponse({ status: 409, description: 'Blog title already exists' })
  async create(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    const blog = await this.blogsService.create(createBlogDto, req.user.userId);
    return {
      success: true,
      data: blog,
      message: 'Blog created successfully',
    };
  }

  @Get('admin/blogs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all blog posts with pagination and filtering' })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('status') status: string,
    @Query('featured') featured: string,
  ) {
    const result = await this.blogsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      category,
      status: status as 'published' | 'draft',
      featured: featured ? featured === 'true' : undefined,
    });

    return {
      success: true,
      data: result.blogs,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('blogs')
  @ApiOperation({ summary: 'Get published blog posts' })
  async findPublished(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('category') category: string,
  ) {
    const result = await this.blogsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      category,
      status: 'published',
    });

    return {
      success: true,
      data: result.blogs,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('blogs/:id')
  @ApiOperation({ summary: 'Get blog post by ID' })
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsService.findOne(id);
    return {
      success: true,
      data: blog,
    };
  }

  @Get('blogs/slug/:slug')
  @ApiOperation({ summary: 'Get blog post by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const blog = await this.blogsService.findBySlug(slug);
    return {
      success: true,
      data: blog,
    };
  }

  @Put('admin/blogs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post' })
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogsService.update(id, updateBlogDto);
    return {
      success: true,
      data: blog,
      message: 'Blog updated successfully',
    };
  }

  @Delete('admin/blogs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post' })
  async remove(@Param('id') id: string) {
    await this.blogsService.remove(id);
    return {
      success: true,
      message: 'Blog deleted successfully',
    };
  }

  @Get('blogs/categories/all')
  @ApiOperation({ summary: 'Get all blog categories' })
  async getCategories() {
    const categories = await this.blogsService.getCategories();
    return {
      success: true,
      data: categories,
    };
  }

  @Get('blogs/tags/all')
  @ApiOperation({ summary: 'Get all blog tags' })
  async getTags() {
    const tags = await this.blogsService.getTags();
    return {
      success: true,
      data: tags,
    };
  }
}
