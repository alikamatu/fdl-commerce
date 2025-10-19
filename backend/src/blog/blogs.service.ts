import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto, authorId: string): Promise<Blog> {
    // Generate slug from title
    const slug = createBlogDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check if slug already exists
    const existingBlog = await this.blogModel.findOne({ slug });
    if (existingBlog) {
      throw new ConflictException('Blog with this title already exists');
    }

    // Calculate reading time (approx 200 words per minute)
    const wordCount = createBlogDto.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const createdBlog = new this.blogModel({
      ...createBlogDto,
      slug,
      authorId: new Types.ObjectId(authorId),
      readingTime,
      publishedAt: createBlogDto.isPublished ? new Date() : null,
    });

    return createdBlog.save();
  }

  async findAll({
    page = 1,
    limit = 10,
    search,
    category,
    status,
    featured,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: 'published' | 'draft';
    featured?: boolean;
  } = {}) {
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.categories = category;
    }

    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    if (featured !== undefined) {
      query.isFeatured = featured;
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.blogModel
        .find(query)
        .populate('authorId', 'displayName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.blogModel.countDocuments(query),
    ]);

    return {
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogModel
      .findById(id)
      .populate('authorId', 'displayName email')
      .exec();

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogModel
      .findOne({ slug })
      .populate('authorId', 'displayName email')
      .exec();

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Increment view count
    await this.blogModel.findByIdAndUpdate(blog._id, {
      $inc: { viewCount: 1 },
    });

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    if (updateBlogDto.title) {
      const slug = updateBlogDto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const existingBlog = await this.blogModel.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingBlog) {
        throw new ConflictException('Blog with this title already exists');
      }

      updateBlogDto['slug'] = slug;
    }

    // Recalculate reading time if content is updated
    if (updateBlogDto.content) {
      const wordCount = updateBlogDto.content.split(/\s+/).length;
      updateBlogDto['readingTime'] = Math.ceil(wordCount / 200);
    }

    // Set publishedAt if publishing for the first time
    if (updateBlogDto.isPublished === true) {
      const existingBlog = await this.blogModel.findById(id);
      if (existingBlog && !existingBlog.publishedAt) {
        updateBlogDto['publishedAt'] = new Date();
      }
    }

    const updatedBlog = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, { new: true })
      .populate('authorId', 'displayName email')
      .exec();

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found');
    }

    return updatedBlog;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Blog not found');
    }
  }

  async getCategories(): Promise<string[]> {
    const blogs = await this.blogModel.find().select('categories');
    const allCategories = blogs.flatMap(blog => blog.categories);
    return [...new Set(allCategories)];
  }

  async getTags(): Promise<string[]> {
    const blogs = await this.blogModel.find().select('tags');
    const allTags = blogs.flatMap(blog => blog.tags);
    return [...new Set(allTags)];
  }
}