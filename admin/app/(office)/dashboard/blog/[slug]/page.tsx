'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  Clock,
  Eye,
  Tag,
  ArrowLeft,
  Edit2,
  Trash2,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

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

interface BlogStats {
  likes: number;
  shares: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface Comment {
  _id: string;
  author: {
    _id: string;
    displayName: string;
    email: string;
  };
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BlogStats>({
    likes: 0,
    shares: 0,
    comments: 0,
    isLiked: false,
    isBookmarked: false,
  });
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch blog post data
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/slug/${slug}`);
        
        if (!response.ok) {
          throw new Error('Blog post not found');
        }
        
        const result = await response.json();
        if (result.success) {
          setBlogPost(result.data);
          
          // Fetch related posts based on categories
          fetchRelatedPosts(result.data.categories, result.data._id);
          
          // Fetch comments
          fetchComments(result.data._id);
          
          // Fetch engagement stats
          fetchStats(result.data._id);
        } else {
          throw new Error(result.message || 'Failed to load blog post');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchRelatedPosts = async (categories: string[], currentPostId: string) => {
    try {
      // Fetch published posts from the same categories
      const categoryQuery = categories.length > 0 ? `&category=${categories[0]}` : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?limit=3${categoryQuery}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Filter out current post and limit to 3 posts
          const related = result.data
            .filter((post: BlogPost) => post._id !== currentPostId && post.isPublished)
            .slice(0, 3);
          setRelatedPosts(related);
        }
      }
    } catch (err) {
      console.error('Failed to fetch related posts:', err);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}/comments`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setComments(result.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const fetchStats = async (postId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}/stats`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleLike = async () => {
    if (!blogPost) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blogPost._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(prev => ({
            ...prev,
            likes: result.data.likes,
            isLiked: result.data.isLiked,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleBookmark = async () => {
    if (!blogPost) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blogPost._id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(prev => ({
            ...prev,
            isBookmarked: result.data.isBookmarked,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  const handleShare = (platform: string) => {
    if (!blogPost) return;
    
    const url = window.location.href;
    const title = blogPost.title;
    const text = blogPost.excerpt;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    
    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogPost || !newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blogPost._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setComments(prev => [result.data, ...prev]);
          setNewComment('');
          setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        }
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!blogPost) return;
    
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${blogPost._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        router.push('/dashboard/blog');
      } else {
        throw new Error('Failed to delete blog post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-gray-200 rounded-2xl p-8 text-center bg-white shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Blog post not found'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The blog post you&#39;re looking for doesn&#39;t exist or you don&#39;t have permission to view it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard/blog')}
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
              >
                Back to Blogs
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      {/* Navigation Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/blog')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blogs</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Blog Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blogPost.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {blogPost.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 mb-8">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{blogPost.author?.displayName ?? blogPost.author?.email ?? 'Forbes Digital LifeLine'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{formatDate(blogPost.createdAt)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{blogPost.readingTime} min read</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span className="font-medium">{blogPost.viewCount.toLocaleString()} views</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {blogPost.isPublished ? (
              <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Published</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Draft</span>
              </div>
            )}
            
            {blogPost.isFeatured && (
              <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
                Featured Post
              </div>
            )}
          </div>
        </motion.header>

        {/* Featured Image */}
        {blogPost.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={blogPost.featuredImage.url}
              alt={blogPost.featuredImage.alt}
              className="w-full h-auto max-h-96 object-cover"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </motion.article>

        {/* Tags */}
        {blogPost.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-2">
              {blogPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="border-t border-gray-200 pt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <motion.article
                  key={post._id}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/dashboard/blog/${post.slug}`)}
                >
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Custom Styles for Blog Content */}
      <style jsx>{`
        .blog-content {
          line-height: 1.8;
          color: #374151;
        }
        
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        
        .blog-content p {
          margin-bottom: 1.5rem;
        }
        
        .blog-content ul, .blog-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        
        .blog-content strong {
          font-weight: 600;
          color: #111827;
        }
        
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .blog-content a:hover {
          color: #1d4ed8;
        }
        
        .blog-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}