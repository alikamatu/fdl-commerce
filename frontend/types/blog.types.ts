export interface BlogImage {
  url: string;
  alt: string;
  publicId: string;
}

export interface BlogAuthor {
  _id: string;
  displayName: string;
  email: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: BlogImage;
  authorId: BlogAuthor;
  categories: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  success: boolean;
  data: Blog[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
}

export interface BlogStats {
  totalBlogs: number;
  totalViews: number;
  featuredCount: number;
}