import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel.findOne({ 
      sku: createProductDto.sku 
    });
    
    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Verify category exists
    const category = await this.categoryModel.findById(createProductDto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll({
    page = 1,
    limit = 10,
    category,
    search,
    brand,
    minPrice,
    maxPrice,
    inStock,
    isDeal,
    sortBy = 'newest' // Add sortBy parameter with default
  }: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isDeal?: boolean;
    sortBy?: string; // Add this
  } = {}) {
    const query: any = { isActive: true };

      query.$or = [
    { isDeal: false },
    { 
      isDeal: true,
      dealExpiresAt: { $gt: new Date() }
    },
    { 
      isDeal: true,
      dealExpiresAt: null
    },
    { 
      isDeal: true,
      dealExpiresAt: { $exists: false }
    }
  ];

    if (category) {
      // Try both ObjectId and string comparison
      query.$or = [
        { categoryId: category },
        { categoryId: new Types.ObjectId(category) }
      ];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined) {
      query.priceCents = { ...query.priceCents, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
      query.priceCents = { ...query.priceCents, $lte: maxPrice };
    }

    if (inStock !== undefined) {
      query.stock = inStock ? { $gt: 0 } : { $lte: 0 };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Add isDeal filter - only show products that are marked as deals AND haven't expired
    if (isDeal !== undefined && isDeal) {
      query.isDeal = true;
      query.dealExpiresAt = { $gt: new Date() }; // Only active deals
    }

    const skip = (page - 1) * limit;

    // Determine sort order based on sortBy parameter
    let sortOption: any = { createdAt: -1 }; // Default: newest first

    switch (sortBy) {
      case 'price-low':
        sortOption = { priceCents: 1 }; // Price: Low to High
        break;
      case 'price-high':
        sortOption = { priceCents: -1 }; // Price: High to Low
        break;
      case 'name':
        sortOption = { title: 1 }; // Name: A to Z
        break;
      case 'stock':
        sortOption = { stock: -1 }; // In Stock First (highest stock first)
        break;
      case 'discount':
        sortOption = { discountPercent: -1, createdAt: -1 }; // Best Discount
        break;
      case 'rating':
        sortOption = { averageRating: -1, createdAt: -1 }; // Highest Rated
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 }; // Newest First
        break;
    }

    console.log('Query:', JSON.stringify(query)); // Debug log
    console.log('Skip:', skip, 'Limit:', limit); // Debug log
    console.log('Sort:', sortOption); // Debug log

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('categoryId', 'name slug imageUrl')
        .sort(sortOption) // Apply dynamic sorting
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    console.log('Found products:', products.length); // Debug log

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ sku })
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    if (updateProductDto.sku) {
      const existingProduct = await this.productModel.findOne({
        sku: updateProductDto.sku,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryModel.findById(updateProductDto.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
  }
  
  if (updateProductDto.isDeal === false) {
    updateProductDto.originalPriceCents = undefined;
    updateProductDto.discountPercent = 0;
    updateProductDto.dealExpiresAt = undefined;
  }
  
  const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('categoryId', 'name slug')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async findDealProducts({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  } = {}) {
    const query: any = { 
      isActive: true,
      isDeal: true,
      dealExpiresAt: { $gt: new Date() } // Only active deals
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('categoryId', 'name slug')
        .sort({ discountPercent: -1, createdAt: -1 }) // Sort by highest discount first
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExpiringDeals(limit: number = 10) {
    return this.productModel
      .find({
        isActive: true,
        isDeal: true,
        dealExpiresAt: { 
          $gt: new Date(),
          $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expiring in next 24 hours
        }
      })
      .populate('categoryId', 'name slug')
      .sort({ dealExpiresAt: 1, discountPercent: -1 })
      .limit(limit)
      .exec();
  }

  async getSearchSuggestions(query: string, limit: number = 8): Promise<any[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const products = await this.productModel
        .find({
          isActive: true,
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { brand: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
          ],
        })
        .select('title brand images priceCents categoryId')
        .populate('categoryId', 'name')
        .limit(limit)
        .exec();

      return products.map(product => ({
        type: 'product',
        id: product._id,
        name: product.title,
        image: product.images[0]?.url,
        category: (product.categoryId as any)?.name,
        priceCents: product.priceCents,
        brand: product.brand,
      }));
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.productModel.findById(id);
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.stock = quantity;
    return product.save();
  }

  async getLowStock(threshold: number = 10): Promise<Product[]> {
    return this.productModel
      .find({
        stock: { $lte: threshold },
        isActive: true,
      })
      .populate('categoryId', 'name slug')
      .sort({ stock: 1 })
      .exec();
  }
}