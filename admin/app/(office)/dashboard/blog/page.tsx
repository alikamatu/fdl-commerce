'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  FileText,
  Clock,
  MoreVertical,
  ChevronDown,
  EyeOff,
  CheckCircle,
  XCircle,
  Upload,
  Save,
  X,
  Router,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
    publicId: string;
  };
  author: {
    _id: string;
    displayName: string;
    email: string;
  };
  categories: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
    publicId: string;
  };
  categories: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
}

export default function BlogDashboardPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: undefined,
    categories: [],
    tags: [],
    isPublished: false,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
  });

  // Load blog posts
  const loadBlogPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to load blog posts');
      
      const result = await response.json();
      setBlogPosts(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  // Load categories and tags
  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/categories/all`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/tags/all`),
      ]);
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data || []);
      }
      
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories/tags:', err);
    }
  };

  useEffect(() => {
    loadBlogPosts();
    loadCategoriesAndTags();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog post');
      }
      
      await loadBlogPosts();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${currentPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blog post');
      }
      
      await loadBlogPosts();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete blog post');
      
      await loadBlogPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      categories: post.categories,
      tags: post.tags,
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featuredImage: undefined,
      categories: [],
      tags: [],
      isPublished: false,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
    });
    setCurrentPost(null);
    setIsEditing(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: result.data.url,
          alt: file.name,
          publicId: result.data.publicId,
        },
      }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           post.categories.includes(selectedCategory);
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'published' && post.isPublished) ||
                         (statusFilter === 'draft' && !post.isPublished);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'views':
        return b.viewCount - a.viewCount;
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Blog Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Create and manage your blog posts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadBlogPosts}
                disabled={loading}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                title="Refresh blogs"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFormOpen(true)}
                className="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>New Post</span>
              </motion.button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">Sort by:</span>
              <div className="flex gap-2">
                {['newest', 'oldest', 'title', 'views'].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === sort
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        {sortedPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 shadow-sm"
          >
            <FileText className="w-20 h-20 mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all' 
                ? 'No blog posts found' 
                : 'No blog posts yet'
              }
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Start your blog by creating your first post'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all' && statusFilter === 'all') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span className="text-lg">Create First Post</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {post.isPublished ? (
                      <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Published
                      </div>
                    ) : (
                      <div className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </div>
                    )}
                    {post.isFeatured && (
                      <div className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2" />
+                      <span>{post.author?.displayName ?? post.author?.email ?? 'Forbes Digital LifeLine'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{post.readingTime} min read</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="w-4 h-4 mr-2" />
                      <span>{post.viewCount} views</span>
                    </div>
                  </div>

                  {/* Categories and Tags */}
                  <div className="space-y-2 mb-6">
                    {post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium"
                          >
                            {category}
                          </span>
                        ))}
                        {post.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{post.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditPost(post)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeletePost(post._id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push(`/dashboard/blog/${post.slug}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Blog Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={isEditing ? handleUpdatePost : handleCreatePost} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter blog post title..."
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter a brief excerpt..."
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-sm"
                    placeholder="Write your blog post content..."
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.featuredImage ? (
                      <div className="relative">
                        <img
                          src={formData.featuredImage.url}
                          alt={formData.featuredImage.alt}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featuredImage: undefined }))}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg w-32 h-32 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="featuredImage"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="featuredImage"
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Categories and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          type="button"
                          key={category}
                          onClick={() => {
                            const updatedCategories = formData.categories.includes(category)
                              ? formData.categories.filter(c => c !== category)
                              : [...formData.categories, category];
                            setFormData(prev => ({ ...prev, categories: updatedCategories }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.categories.includes(category)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 10).map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            const updatedTags = formData.tags.includes(tag)
                              ? formData.tags.filter(t => t !== tag)
                              : [...formData.tags, tag];
                            setFormData(prev => ({ ...prev, tags: updatedTags }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.tags.includes(tag)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add custom tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const tag = input.value.trim();
                          if (tag && !formData.tags.includes(tag)) {
                            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                            input.value = '';
                          }
                        }
                      }}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="SEO meta title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="SEO meta description..."
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Feature this post</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}