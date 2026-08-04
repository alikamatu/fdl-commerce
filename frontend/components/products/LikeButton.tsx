"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  productId: string;
  initialLikeCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  productId,
  initialLikeCount = 0,
  size = 'md',
  showCount = true,
  className = '',
}) => {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch initial like status from server
  const fetchLikeStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setHasFetched(true);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/like-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLiked(data.data.liked);
          setLikeCount(data.data.likeCount);
        }
      }
    } catch (error) {
      // Silently fail — use initial values
      console.error('Failed to fetch like status:', error);
    } finally {
      setHasFetched(true);
    }
  }, [productId]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  // Keep likeCount in sync with prop changes (e.g., from product list refresh)
  useEffect(() => {
    if (!hasFetched) {
      setLikeCount(initialLikeCount);
    }
  }, [initialLikeCount, hasFetched]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? Math.max(0, likeCount - 1) : likeCount + 1);
    setIsAnimating(!liked);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
      }
    } catch (error) {
      // Rollback on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const sizeClasses = {
    sm: 'gap-1 text-xs',
    md: 'gap-1.5 text-sm',
    lg: 'gap-2 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-2.5 py-1.5',
    lg: 'px-3 py-2',
  };

  return (
    <motion.button
      onClick={handleToggleLike}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
      className={`inline-flex items-center rounded-full transition-all duration-300 font-medium ${
        liked
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-background/80 text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/30 hover:bg-background'
      } ${paddingClasses[size]} ${sizeClasses[size]} disabled:opacity-70 ${className}`}
      title={liked ? 'Unlike this product' : 'Like this product'}
    >
      <motion.div
        animate={{
          scale: isAnimating ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.6 }}
      >
        <ThumbsUp
          size={iconSizes[size]}
          className={liked ? 'fill-current' : ''}
        />
      </motion.div>
      {showCount && (
        <span>{likeCount}</span>
      )}
    </motion.button>
  );
};
