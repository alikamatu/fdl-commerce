'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Edit2, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  User,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

interface Review {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
  };
  productId: string;
  product?: {
    title: string;
    images: Array<{ url: string }>;
  };
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isActive: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  votedBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Filters {
  rating: string;
  status: string;
  verified: string;
  search: string;
}

export default function AdminReviewsDashboardPage() {
  const { addAlert } = useAlert();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    rating: '',
    status: '',
    verified: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.status && { isActive: filters.status === 'active' ? 'true' : 'false' }),
        ...(filters.verified && { isVerified: filters.verified }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/all?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ReviewsResponse = await response.json();
      setReviews(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load reviews'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews(pagination.page);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchReviews(1);
  };

  const clearFilters = () => {
    setFilters({
      rating: '',
      status: '',
      verified: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchReviews(1);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedReviews.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      for (const reviewId of selectedReviews) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/${reviewId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: action === 'delete' ? 'delete' : 'toggle',
              isActive: action === 'activate'
            })
          }
        );
      }

      addAlert({
        type: 'success',
        title: 'Success',
        message: `${selectedReviews.length} review(s) updated successfully`
      });

      setSelectedReviews([]);
      fetchReviews(pagination.page);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to perform bulk action'
      });
    }
  };

  const handleReviewAction = async (reviewId: string, action: 'toggle' | 'delete') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/${reviewId}`,
        {
          method: action === 'delete' ? 'DELETE' : 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            ...(action !== 'delete' && { 'Content-Type': 'application/json' }),
          },
          ...(action !== 'delete' && {
            body: JSON.stringify({ 
              action: 'toggle',
              isActive: !reviews.find(r => r._id === reviewId)?.isActive
            })
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      addAlert({
        type: 'success',
        title: 'Success',
        message: `Review ${action === 'delete' ? 'deleted' : 'updated'} successfully`
      });

      fetchReviews(pagination.page);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update review'
      });
    }
  };

  const toggleReviewSelection = (reviewId: string) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const selectAllReviews = () => {
    setSelectedReviews(
      selectedReviews.length === reviews.length ? [] : reviews.map(r => r._id)
    );
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const ReviewRow = ({ review }: { review: Review }) => {
    const isExpanded = expandedReview === review._id;
    const isSelected = selectedReviews.includes(review._id);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-all duration-200 ${
          isExpanded ? 'shadow-sm' : ''
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Selection Checkbox */}
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleReviewSelection(review._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
              {review.product?.images?.[0] ? (
                <img
                  src={review.product.images[0].url}
                  alt={review.product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400 m-auto mt-2" />
              )}
            </div>

            {/* Review Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {review.title}
                    </h3>
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{review.userId.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={14} />
                      <span className="line-clamp-1 max-w-[200px]">
                        {review.product?.title || 'Product not found'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {review.isVerified && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                          Verified
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        review.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {review.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{review.helpfulVotes} helpful</span>
                      </div>
                      {review.images.length > 0 && (
                        <span className="text-blue-600">{review.images.length} photo(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExpandedReview(isExpanded ? null : review._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReviewAction(review._id, 'delete')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded View */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Review Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Review Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Email:</span>
                      <span className="text-gray-900">{review.userId.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">{formatDate(review.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Engagement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Helpful Votes</span>
                      <span className="font-semibold text-green-600">{review.helpfulVotes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unhelpful Votes</span>
                      <span className="font-semibold text-red-600">{review.unhelpfulVotes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Voters</span>
                      <span className="font-semibold text-gray-900">{review.votedBy.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Images */}
              {review.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Review Images</h4>
                  <div className="flex gap-3 overflow-x-auto">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage and moderate customer reviews
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Verified Filter */}
            <select
              value={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Reviews</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  {selectedReviews.length} review(s) selected
                </span>
              </div>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
          </motion.div>
        )}

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedReviews.length === reviews.length && reviews.length > 0}
                onChange={selectAllReviews}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Showing {reviews.length} of {pagination.total} reviews
              </span>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchReviews(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-3">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchReviews(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading reviews...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && reviews.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-6">No reviews match your current filters.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Reviews Grid */}
          {!loading && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewRow key={review._id} review={review} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}