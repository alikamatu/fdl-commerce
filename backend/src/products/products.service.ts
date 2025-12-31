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

    const category = await this.categoryModel.findById(createProductDto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  // In products.service.ts, add this method:
async updateExpiredDeals(): Promise<void> {
  const currentDate = new Date();
  
  await this.productModel.updateMany(
    {
      isDeal: true,
      dealExpiresAt: { $lte: currentDate }
    },
    {
      $set: {
        isDeal: false,
        originalPriceCents: undefined,
        discountPercent: 0,
        dealExpiresAt: undefined
      }
    }
  );
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
  sortBy = 'newest'
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
  sortBy?: string;
} = {}) {
  // Start with base query
  const query: any = { isActive: true };

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

  // IMPORTANT FIX: Handle deal filtering correctly
  if (isDeal !== undefined) {
    if (isDeal) {
      // When specifically looking for deals, only show ACTIVE deals
      query.isDeal = true;
      query.$or = [
        { dealExpiresAt: { $gt: new Date() } },
        { dealExpiresAt: null },
        { dealExpiresAt: { $exists: false } }
      ];
    } else {
      // When NOT looking for deals, show non-deals AND expired deals
      query.$or = [
        { isDeal: false },
        { 
          isDeal: true,
          dealExpiresAt: { $lt: new Date() }
        }
      ];
    }
  } else {
    // By default (isDeal not specified), show all products including expired deals as normal products
    // No special filtering needed - the application logic will handle expired deals
  }

  const skip = (page - 1) * limit;

  // ... rest of your sort logic remains the same
  let sortOption: any = { createdAt: -1 };

  switch (sortBy) {
    case 'price-low':
      sortOption = { priceCents: 1 };
      break;
    case 'price-high':
      sortOption = { priceCents: -1 };
      break;
    case 'name':
      sortOption = { title: 1 };
      break;
    case 'stock':
      sortOption = { stock: -1 };
      break;
    case 'discount':
      sortOption = { discountPercent: -1, createdAt: -1 };
      break;
    case 'rating':
      sortOption = { averageRating: -1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const [products, total] = await Promise.all([
    this.productModel
      .find(query)
      .populate('categoryId', 'name slug imageUrl')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .exec(),
    this.productModel.countDocuments(query),
  ]);

  // Post-processing: Automatically convert expired deals to normal products
  const currentDate = new Date();
  const processedProducts = products.map(product => {
    const productObj = product.toObject();
    
    // If deal has expired, convert it to a normal product
    if (productObj.isDeal && productObj.dealExpiresAt && 
        productObj.dealExpiresAt <= currentDate) {
      productObj.isDeal = false;
      productObj.originalPriceCents = undefined;
      productObj.discountPercent = 0;
      productObj.dealExpiresAt = undefined;
    }
    
    return productObj;
  });

  return {
    products: processedProducts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async findOne(id: string): Promise<any> {
  const product = await this.productModel
    .findById(id)
    .populate('categoryId', 'name slug')
    .exec();

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Convert expired deal to normal product
  const productObj = product.toObject();
  const currentDate = new Date();
  
  if (productObj.isDeal && productObj.dealExpiresAt && 
      productObj.dealExpiresAt <= currentDate) {
    productObj.isDeal = false;
    productObj.originalPriceCents = undefined;
    productObj.discountPercent = 0;
    productObj.dealExpiresAt = undefined;
  }

  return productObj;
}

async findBySku(sku: string): Promise<any> {
  const product = await this.productModel
    .findOne({ sku })
    .populate('categoryId', 'name slug')
    .exec();

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Convert expired deal to normal product
  const productObj = product.toObject();
  const currentDate = new Date();
  
  if (productObj.isDeal && productObj.dealExpiresAt && 
      productObj.dealExpiresAt <= currentDate) {
    productObj.isDeal = false;
    productObj.originalPriceCents = undefined;
    productObj.discountPercent = 0;
    productObj.dealExpiresAt = undefined;
  }

  return productObj;
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