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
    // Check if SKU already exists
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
  inStock
}: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
} = {}) {
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

  const skip = (page - 1) * limit;

  console.log('Query:', JSON.stringify(query)); // Debug log
  console.log('Skip:', skip, 'Limit:', limit); // Debug log

  const [products, total] = await Promise.all([
    this.productModel
      .find(query)
      .populate('categoryId', 'name slug imageUrl')
      .sort({ createdAt: -1 })
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