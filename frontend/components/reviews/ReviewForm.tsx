"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X, Upload, Image as ImageIcon } from 'lucide-react';

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
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

// In your ReviewForm component, add better validation
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  // Validation
  const newErrors: Record<string, string> = {};
  if (rating === 0) newErrors.rating = 'Please select a rating';
  if (!title.trim()) newErrors.title = 'Title is required';
  if (!comment.trim()) newErrors.comment = 'Comment is required';
  
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
      images: images.length > 0 ? images : undefined,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload to cloud storage and get URLs
    // For now, we'll use object URLs (not suitable for production)
    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      newImages.push(URL.createObjectURL(files[i]));
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
              placeholder="Summarize your experience"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
                errors.title ? 'border-red-500' : 'border-foreground/20'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience with this product..."
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
                errors.comment ? 'border-red-500' : 'border-foreground/20'
              }`}
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add Photos (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed border-foreground/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-foreground/40 transition-colors">
                    <Upload size={20} className="text-foreground/40" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-foreground/60">
                You can upload up to 5 images
              </p>
            </div>
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};