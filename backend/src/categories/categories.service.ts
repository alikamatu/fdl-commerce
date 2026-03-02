import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    name: string,
    slug: string,
    imageUrl?: string,
    imagePublicId?: string,
  ): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    const category = new this.categoryModel({
      name,
      slug,
      imageUrl,
      imagePublicId,
    });
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

  async update(
    id: string,
    name: string,
    slug: string,
    imageUrl?: string,
    imagePublicId?: string,
  ): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    const currentCategory = await this.categoryModel.findById(id);
    if (!currentCategory) {
      throw new NotFoundException('Category not found');
    }

    if (imageUrl && currentCategory.imagePublicId) {
      try {
        await this.fileUploadService.deleteImage(currentCategory.imagePublicId);
      } catch (error) {
        console.error('Failed to delete old image:', error);
      }
    }

    const updateData: any = { name, slug };
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId;

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.imagePublicId) {
      try {
        await this.fileUploadService.deleteImage(category.imagePublicId);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }

    await this.categoryModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
  }
}
