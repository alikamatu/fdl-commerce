"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface ReviewFormProps {
  product: {
    id: string;
    title: string;
    image: string;
  };
  orderId: string;
  onSubmit: (reviewData: {
    productId: string;
    orderId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) => Promise<boolean>;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  product,
  orderId,
  onSubmit,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate word count
  const wordCount = comment.trim() ? comment.trim().split(/\s+/).length : 0;
  const minWords = 25;
  const isCommentValid = wordCount >= minWords;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!comment.trim()) newErrors.comment = 'Review text is required';
    
    // Validate word count
    if (!isCommentValid) {
      newErrors.comment = `Please write at least ${minWords} words. Currently ${wordCount} words.`;
    }
    
    // Validate orderId
    if (!orderId || orderId.trim() === '') {
      newErrors.submit = 'Unable to submit review. Please ensure you have purchased this product.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit({
        productId: product.id,
        orderId: orderId.trim(),
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      if (!success) {
        setErrors({ submit: 'Failed to submit review. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while submitting your review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWordCountColor = () => {
    if (wordCount === 0) return 'text-foreground/60';
    if (wordCount < minWords) return 'text-amber-600';
    return 'text-green-600';
  };

  const getWordCountMessage = () => {
    if (wordCount === 0) return `Minimum ${minWords} words required`;
    if (wordCount < minWords) return `${minWords - wordCount} more words needed`;
    return 'Great! Your review meets the length requirement';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-foreground/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Write a Review</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-foreground/60 mt-1">Share your experience with {product.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Preview */}
          <div className="flex items-center space-x-4 p-4 bg-foreground/5 rounded-lg">
            <img
              src={product.image}
              alt={product.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-foreground/60">Verified Purchase</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Overall Rating *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-foreground/20'
                    }
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Review Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience in a few words"
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
                errors.title ? 'border-red-500' : 'border-foreground/20'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-xs text-foreground/60">
                Brief summary of your experience
              </span>
              <span className="text-xs text-foreground/60">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="comment" className="block text-sm font-medium">
                Detailed Review *
              </label>
              <div className={`text-xs font-medium ${getWordCountColor()}`}>
                {wordCount} / {minWords} words
              </div>
            </div>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Please share your detailed experience with this product. Write at least ${minWords} words to help other customers make informed decisions.

• How does the product perform?
• What do you like about it?
• Any issues or suggestions?
• Would you recommend it to others?`}
              rows={8}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none ${
                errors.comment ? 'border-red-500' : 
                !isCommentValid && comment.trim() ? 'border-amber-300' : 'border-foreground/20'
              }`}
            />
            {errors.comment ? (
              <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
            ) : (
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${getWordCountColor()}`}>
                  {getWordCountMessage()}
                </span>
                <span className="text-xs text-foreground/60">
                  Minimum {minWords} words required
                </span>
              </div>
            )}
          </div>

          {/* Requirements Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Review Requirements
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Minimum {minWords} words for detailed review</li>
              <li>• Be honest and specific about your experience</li>
              <li>• Focus on product quality, features, and performance</li>
              <li>• Avoid personal information or promotional content</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isCommentValid}
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};