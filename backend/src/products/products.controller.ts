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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('products')
@Controller('api')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product SKU already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

@Get('products')
@ApiOperation({ summary: 'Get all products with pagination and filtering' })
@ApiResponse({ status: 200, description: 'Products retrieved successfully' })
async findAll(
  @Query('page') page: string,
  @Query('limit') limit: string,
  @Query('category') category: string,
  @Query('q') search: string,
  @Query('brand') brand: string,
  @Query('minPrice') minPrice: string,
  @Query('maxPrice') maxPrice: string,
  @Query('inStock') inStock: string,
  @Query('isDeal') isDeal: string, // Add this parameter
) {
  const result = await this.productsService.findAll({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    category,
    search,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    inStock: inStock ? inStock === 'true' : undefined,
    brand,
    isDeal: isDeal ? isDeal === 'true' : undefined, // Add this
  });

  return {
    success: true,
    data: result.products, 
    pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  };
}

@Get('products/deals')
@ApiOperation({ summary: 'Get deal products' })
@ApiResponse({ status: 200, description: 'Deal products retrieved successfully' })
async findDeals(
  @Query('page') page: string,
  @Query('limit') limit: string,
) {
  const result = await this.productsService.findDealProducts({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
  });

  return {
    success: true,
    data: result.products,
    pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  };
}

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      success: true,
      data: product,
    };
  }

  @Get('products/sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySku(@Param('sku') sku: string) {
    const product = await this.productsService.findBySku(sku);
    return {
      success: true,
      data: product,
    };
  }

  @Put('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product SKU already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
  
@Get('products/search/suggestions')
@ApiOperation({ summary: 'Get search suggestions' })
@ApiResponse({ status: 200, description: 'Search suggestions retrieved successfully' })
async getSearchSuggestions(
  @Query('q') query: string,
  @Query('limit') limit: string,
) {
  const suggestions = await this.productsService.getSearchSuggestions(
    query,
    limit ? parseInt(limit) : 8,
  );

  return {
    success: true,
    data: suggestions,
  };
}

  @Post('admin/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      })
    ) file: Express.Multer.File,
  ) {
    const result = await this.fileUploadService.uploadImage(file);
    return {
      success: true,
      data: result,
      message: 'Image uploaded successfully',
    };
  }

  @Get('admin/products/low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low stock products' })
  async getLowStock(@Query('threshold') threshold: string) {
    const products = await this.productsService.getLowStock(
      threshold ? parseInt(threshold) : 10,
    );
    return {
      success: true,
      data: products,
    };
  }
}