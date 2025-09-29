import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(name: string, slug: string): Promise<Category> {
    // Check if slug already exists
    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    const category = new this.categoryModel({ name, slug });
    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, name: string, slug: string): Promise<Category> {
    // Check if slug already exists (excluding current category)
    const existingCategory = await this.categoryModel.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}