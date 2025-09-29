import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  async seedCategories() {
    const categories = [
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Mobile Phones', slug: 'mobile-phones' },
      { name: 'Accessories', slug: 'accessories' },
    ];

    for (const categoryData of categories) {
      const existingCategory = await this.categoryModel.findOne({
        slug: categoryData.slug,
      });

      if (!existingCategory) {
        await this.categoryModel.create(categoryData);
        console.log(`Created category: ${categoryData.name}`);
      }
    }
  }
}