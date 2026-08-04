"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, ThumbsUp, ThumbsDown, MessageSquare, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Review, ReviewStats } from '@/hooks/useReviews';
import { ReviewForm } from './ReviewForm';
import { useAuth } from '@/context/AuthContext';
import { useReviews } from '@/hooks/useReviews';

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  productImage: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productTitle,
  productImage,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCanReview, setUserCanReview] = useState(false);
  const [reviewableProducts, setReviewableProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [votingState, setVotingState] = useState<{[key: string]: 'helpful' | 'unhelpful' | null}>({});
  const [voteError, setVoteError] = useState<string | null>(null);
  const { user } = useAuth();
  const { createReview } = useReviews();

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const url = `${apiUrl}/reviews/product/${productId}?page=${page}&limit=5`;
      
      console.log('Fetching reviews from:', url);
      
      const response = await fetch(url);

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      console.log('Reviews response data:', data);

      if (data.success) {
        const reviewsData = Array.isArray(data.data) ? data.data : [];
        console.log('Setting reviews:', reviewsData);
        setReviews(reviewsData);
        setTotalPages(data.pagination?.pages || 1);

        // Initialize voting state based on helpfulVotedBy / unhelpfulVotedBy arrays
        const newVotingState: {[key: string]: 'helpful' | 'unhelpful' | null} = {};
        reviewsData.forEach((review: Review) => {
          if (user) {
            if (review.helpfulVotedBy && review.helpfulVotedBy.includes(user.id)) {
              newVotingState[review._id] = 'helpful';
            } else if (review.unhelpfulVotedBy && review.unhelpfulVotedBy.includes(user.id)) {
              newVotingState[review._id] = 'unhelpful';
            } else if (review.votedBy && review.votedBy.includes(user.id)) {
              // Legacy fallback
              newVotingState[review._id] = 'helpful';
            } else {
              newVotingState[review._id] = null;
            }
          } else {
            newVotingState[review._id] = null;
          }
        });
        setVotingState(newVotingState);
      } else {
        console.error('API returned success: false', data);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const url = `${apiUrl}/reviews/product/${productId}/stats`;
      
      console.log('Fetching review stats from:', url);
      
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log('Review stats data:', data);
        
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchUserReviewableProducts = async () => {
    if (!user?.token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const url = `${apiUrl}/reviews/user/reviewable-products`;
      
      console.log('Fetching reviewable products from:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reviewable products data:', data);
        
        if (data.success) {
          const userReviewableProducts = data.data.filter(
            (product: any) => product.productId === productId
          );
          setReviewableProducts(userReviewableProducts);
          setUserCanReview(userReviewableProducts.length > 0);
        }
      }
    } catch (error) {
      console.error('Error fetching reviewable products:', error);
    }
  };

  useEffect(() => {
    console.log('ProductReviews mounted, productId:', productId);
    fetchReviews(currentPage);
    fetchReviewStats();
    
    if (user) {
      fetchUserReviewableProducts();
    }
  }, [productId, currentPage, user]);

  const handleReviewSubmit = async (reviewData: {
    productId: string;
    orderId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) => {
    if (!user?.token) return false;

    try {
      if (!reviewData.orderId && reviewableProducts.length > 0) {
        reviewData.orderId = reviewableProducts[0].orderId;
      }

      if (!reviewData.orderId) {
        alert('You need to purchase this product before you can review it.');
        return false;
      }

      const success = await createReview(reviewData);
      if (success) {
        setShowReviewForm(false);
        fetchReviews(currentPage);
        fetchReviewStats();
        fetchUserReviewableProducts();
        return true;
      } else {
        alert('Failed to submit review. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
      return false;
    }
  };

  const handleVote = async (reviewId: string, type: 'helpful' | 'unhelpful') => {
    if (!user?.token) {
      setVoteError('Please log in to vote on reviews.');
      setTimeout(() => setVoteError(null), 3000);
      return;
    }

    const currentVote = votingState[reviewId];

    // Optimistic UI updates
    setVotingState(prev => ({
      ...prev,
      [reviewId]: currentVote === type ? null : type
    }));

    setReviews(prevReviews => prevReviews.map(review => {
      if (review._id !== reviewId) return review;

      let hVotes = review.helpfulVotes;
      let uVotes = review.unhelpfulVotes;

      if (type === 'helpful') {
        if (currentVote === 'helpful') {
          hVotes = Math.max(0, hVotes - 1);
        } else {
          hVotes += 1;
          if (currentVote === 'unhelpful') {
            uVotes = Math.max(0, uVotes - 1);
          }
        }
      } else {
        if (currentVote === 'unhelpful') {
          uVotes = Math.max(0, uVotes - 1);
        } else {
          uVotes += 1;
          if (currentVote === 'helpful') {
            hVotes = Math.max(0, hVotes - 1);
          }
        }
      }

      return {
        ...review,
        helpfulVotes: hVotes,
        unhelpfulVotes: uVotes
      };
    }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(
        `${apiUrl}/reviews/${reviewId}/${type}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Refetch in background to ensure database sync
        fetchReviews(currentPage);
        setVoteError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      setVoteError('Failed to vote. Rolling back...');
      setTimeout(() => setVoteError(null), 3000);
      
      // Rollback optimistic update
      fetchReviews(currentPage);
    }
  };

  const RatingStars = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      setVoteError('Please log in to write a review.');
      setTimeout(() => setVoteError(null), 3000);
      return;
    }

    if (!userCanReview) {
      setVoteError('You can only review products you have purchased and received. Please check your orders after delivery.');
      setTimeout(() => setVoteError(null), 3000);
      return;
    }

    setShowReviewForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="border-t border-foreground/10 pt-8 mt-8"
    >
      {/* Vote Error Banner */}
      {voteError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
            <p className="text-red-700 text-sm">{voteError}</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light text-foreground mb-2">Customer Reviews</h2>
          {stats && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-foreground">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div>
                  <RatingStars rating={Math.round(stats.averageRating)} />
                  <div className="text-sm text-foreground/60">
                    {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {user && (
          <button
            onClick={handleWriteReviewClick}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              userCanReview
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!userCanReview}
            title={
              !userCanReview 
                ? 'You can only review products you have purchased and received' 
                : 'Write a review'
            }
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Distribution */}
      {stats && stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <h3 className="font-medium text-foreground/80 mb-3">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-foreground/60">{rating}</span>
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 bg-foreground/10 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-foreground/60 w-12">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-foreground/80 mb-3">Review Highlights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-foreground/5 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-foreground/60">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-foreground/5 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalReviews}
                </div>
                <div className="text-sm text-foreground/60">Total Reviews</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>Error loading reviews: {error}</p>
          <button
            onClick={() => fetchReviews(currentPage)}
            className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-4 mb-3">
                <div className="w-10 h-10 bg-foreground/10 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-foreground/10 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-foreground/10 rounded w-1/6" />
                </div>
              </div>
              <div className="h-4 bg-foreground/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-foreground/10 rounded w-full mb-1" />
              <div className="h-3 bg-foreground/10 rounded w-2/3" />
            </div>
          ))
        ) : reviews.length === 0 && !error ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Reviews Yet</h3>
            <p className="text-foreground/60 mb-6">
              {user && userCanReview 
                ? "Be the first to share your thoughts about this product!"
                : "No reviews yet. Purchase this product to be the first to review!"
              }
            </p>
            {user && userCanReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
              >
                Write the First Review
              </button>
            )}
          </div>
        ) : (
          <>
            {reviews.map((review, index) => {
              const userVote = votingState[review._id];
              
              return (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-foreground/10 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center">
                        <User size={20} className="text-foreground/40" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {review.user?.displayName || 'Anonymous User'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          <RatingStars rating={review.rating} size={14} />
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                          {review.isVerified && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground text-lg">
                      {review.title}
                    </h4>
                    <p className="text-foreground/80 leading-relaxed">
                      {review.comment}
                    </p>
 
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`Review image ${imgIndex + 1}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    )}
 
                    <div className="flex items-center justify-between pt-3 border-t border-foreground/5">
                      <div className="text-sm text-foreground/60">
                        Was this review helpful?
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(review._id, 'helpful')}
                          className={`flex items-center gap-1 px-3 py-1 text-sm border rounded-lg transition-all duration-300 ${
                            userVote === 'helpful'
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'border-foreground/20 hover:bg-foreground/5'
                          }`}
                          title="Mark as helpful"
                        >
                          <motion.div
                            whileTap={{ scale: 0.7 }}
                            whileHover={{ scale: 1.15 }}
                            transition={{ type: "spring", stiffness: 450, damping: 15 }}
                            className="flex items-center"
                          >
                            <ThumbsUp size={14} className={userVote === 'helpful' ? 'fill-current' : ''} />
                          </motion.div>
                          {review.helpfulVotes > 0 && (
                            <span className="text-xs font-medium">{review.helpfulVotes}</span>
                          )}
                        </button>
                        <button
                          onClick={() => handleVote(review._id, 'unhelpful')}
                          className={`flex items-center gap-1 px-3 py-1 text-sm border rounded-lg transition-all duration-300 ${
                            userVote === 'unhelpful'
                              ? 'bg-red-500 text-white border-red-500 shadow-sm'
                              : 'border-foreground/20 hover:bg-foreground/5'
                          }`}
                          title="Mark as unhelpful"
                        >
                          <motion.div
                            whileTap={{ scale: 0.7 }}
                            whileHover={{ scale: 1.15 }}
                            transition={{ type: "spring", stiffness: 450, damping: 15 }}
                            className="flex items-center"
                          >
                            <ThumbsDown size={14} className={userVote === 'unhelpful' ? 'fill-current' : ''} />
                          </motion.div>
                          {review.unhelpfulVotes > 0 && (
                            <span className="text-xs font-medium">{review.unhelpfulVotes}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-foreground text-background'
                            : 'border border-foreground/20 hover:bg-foreground/5'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showReviewForm && userCanReview && (
        <ReviewForm
          product={{
            id: productId,
            title: productTitle,
            image: productImage,
          }}
          orderId={reviewableProducts[0]?.orderId || ''}
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </motion.div>
  );
};