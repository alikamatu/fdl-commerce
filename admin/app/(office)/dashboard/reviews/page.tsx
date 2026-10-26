'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Star, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  User,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  X
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
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({ title: '', comment: '', rating: 5 });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    rating: '',
    status: '',
    verified: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
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

      setDeleteConfirm(null);
      fetchReviews(pagination.page);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update review'
      });
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      title: review.title,
      comment: review.comment,
      rating: review.rating,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingReview) return;

    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/${editingReview._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      addAlert({
        type: 'success',
        title: 'Success',
        message: 'Review updated successfully',
      });

      setEditingReview(null);
      fetchReviews(pagination.page);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update review',
      });
    } finally {
      setEditLoading(false);
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

  const statusBadges = (review: Review) => (
    <div className="flex flex-wrap items-center gap-2">
      {review.isVerified && (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
          Verified
        </span>
      )}
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          review.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {review.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );

  const ReviewExpanded = ({ review }: { review: Review }) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 pt-4 border-t border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Review Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3 min-w-0">
              <span className="text-gray-600 flex-shrink-0">User Email:</span>
              <span className="text-gray-900 break-all sm:text-right">{review.userId.email}</span>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3 min-w-0">
              <span className="text-gray-600 flex-shrink-0">Last Updated:</span>
              <span className="text-gray-900 sm:text-right">{formatDate(review.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Engagement</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center gap-3">
              <span className="text-gray-600">Helpful Votes</span>
              <span className="font-semibold text-green-600">{review.helpfulVotes}</span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-gray-600">Unhelpful Votes</span>
              <span className="font-semibold text-red-600">{review.unhelpfulVotes}</span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-gray-600">Total Voters</span>
              <span className="font-semibold text-gray-900">{review.votedBy.length}</span>
            </div>
          </div>
        </div>
      </div>

      {review.images.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Review Images</h4>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-20 h-20 rounded-lg object-contain border border-gray-200 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const ReviewRow = ({ review }: { review: Review }) => {
    const isExpanded = expandedReview === review._id;
    const isSelected = selectedReviews.includes(review._id);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-all duration-200 overflow-hidden ${
          isExpanded ? 'shadow-sm' : ''
        }`}
      >
        {/* Mobile card */}
        <div className="md:hidden p-4 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleReviewSelection(review._id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-1 flex-shrink-0"
              aria-label={`Select review ${review.title}`}
            />
            <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
              {review.product?.images?.[0] ? (
                <img
                  src={review.product.images[0].url}
                  alt={review.product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400 m-auto mt-3" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{review.title}</h3>
              <div className="mt-1">{renderStars(review.rating)}</div>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-3">{review.comment}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <div className="flex items-center gap-1 min-w-0 max-w-full">
              <User size={14} className="flex-shrink-0" />
              <span className="truncate">{review.userId.displayName}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0 max-w-full">
              <Package size={14} className="flex-shrink-0" />
              <span className="truncate">{review.product?.title || 'Product not found'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="flex-shrink-0" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {statusBadges(review)}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={14} />
                {review.helpfulVotes} helpful
              </span>
              {review.images.length > 0 && (
                <span className="text-blue-600">{review.images.length} photo(s)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setExpandedReview(isExpanded ? null : review._id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 min-h-11 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isExpanded ? 'Less' : 'Details'}
            </button>
            <button
              type="button"
              onClick={() => openEditModal(review)}
              className="inline-flex items-center justify-center p-2.5 min-h-11 min-w-11 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              title="Edit review"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm({ id: review._id, title: review.title })}
              className="inline-flex items-center justify-center p-2.5 min-h-11 min-w-11 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Delete review"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {isExpanded && <ReviewExpanded review={review} />}
        </div>

        {/* Tablet / desktop row */}
        <div className="hidden md:block p-4 lg:p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleReviewSelection(review._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                aria-label={`Select review ${review.title}`}
              />
            </div>

            <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
              {review.product?.images?.[0] ? (
                <img
                  src={review.product.images[0].url}
                  alt={review.product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400 m-auto mt-3" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 lg:line-clamp-1 min-w-0">
                      {review.title}
                    </h3>
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{review.comment}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1 min-w-0">
                      <User size={14} className="flex-shrink-0" />
                      <span className="truncate max-w-[10rem] lg:max-w-[14rem]">
                        {review.userId.displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Package size={14} className="flex-shrink-0" />
                      <span className="truncate max-w-[10rem] lg:max-w-[14rem]">
                        {review.product?.title || 'Product not found'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end xl:flex-shrink-0">
                  <div className="flex flex-col items-start xl:items-end gap-2">
                    {statusBadges(review)}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
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
                      className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(review)}
                      className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <Edit2 size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm({ id: review._id, title: review.title })}
                      className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {isExpanded && <ReviewExpanded review={review} />}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:gap-6"
        >
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-shrink-0">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Review Management
                  </h1>
                  <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg">
                    Manage and moderate customer reviews
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 min-h-11 min-w-11 inline-flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50 flex-shrink-0"
                  title="Refresh reviews"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-2.5 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
              className="px-4 py-2.5 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Verified Filter */}
            <select
              value={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
              className="px-4 py-2.5 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Reviews</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 min-h-11 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 min-h-11 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-blue-800 font-medium">
                  {selectedReviews.length} review(s) selected
                </span>
              </div>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2.5 min-h-11 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-medium w-full sm:w-auto"
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
          {/* List controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 sm:gap-4 min-w-0 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedReviews.length === reviews.length && reviews.length > 0}
                onChange={selectAllReviews}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                Showing {reviews.length} of {pagination.total} reviews
              </span>
            </label>
            
            {/* Pagination */}
            <div className="admin-toolbar w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => fetchReviews(Number(pagination.page) - 1)}
                disabled={Number(pagination.page) === 1}
                className="px-3 py-2 min-h-11 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-2 sm:px-3 whitespace-nowrap">
                Page {pagination.page} of {pagination.pages || 1}
              </span>
              <button
                onClick={() => fetchReviews(Number(pagination.page) + 1)}
                disabled={Number(pagination.page) === Number(pagination.pages) || Number(pagination.pages) === 0}
                className="px-3 py-2 min-h-11 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

        {/* Edit Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Review</h3>
                <button
                  onClick={() => setEditingReview(null)}
                  className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex flex-wrap items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, rating: star }))}
                        className="p-2 min-h-11 min-w-11 inline-flex items-center justify-center transition-colors"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          size={24}
                          className={star <= editForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">({editForm.rating}/5)</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Review title"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Review comment"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-3 min-h-11 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={editLoading || !editForm.title.trim() || !editForm.comment.trim()}
                  className="px-6 py-3 min-h-11 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Review</h3>
                <p className="text-gray-600 mb-1">Are you sure you want to permanently delete this review?</p>
                <p className="text-sm text-gray-500 font-medium break-words px-2">&ldquo;{deleteConfirm.title}&rdquo;</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 min-h-11 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewAction(deleteConfirm.id, 'delete')}
                  className="px-6 py-3 min-h-11 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}