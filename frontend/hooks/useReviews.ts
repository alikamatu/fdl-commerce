"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  votedBy: string[];
  helpfulVotedBy?: string[];
  unhelpfulVotedBy?: string[];
  createdAt: string;
  user?: {
    displayName: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewableProduct {
  productId: string;
  productTitle: string;
  productImage: string;
  orderId: string;
  orderNumber: string;
  purchasedDate: string;
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableProducts, setReviewableProducts] = useState<ReviewableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProductReviews = async (productId: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`
      );

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewableProducts = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/user/reviewable-products`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch reviewable products');

      const data = await response.json();
      if (data.success) {
        setReviewableProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching reviewable products:', err);
    }
  };

  const createReview = async (reviewData: {
    productId: string;
    orderId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<boolean> => {
    if (!user?.token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) throw new Error('Failed to create review');

      const data = await response.json();
      return data.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      return false;
    }
  };

  const voteHelpful = async (reviewId: string): Promise<boolean> => {
    if (!user?.token) return false;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/helpful`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      return response.ok;
    } catch (err) {
      console.error('Error voting helpful:', err);
      return false;
    }
  };

  const voteUnhelpful = async (reviewId: string): Promise<boolean> => {
    if (!user?.token) return false;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/unhelpful`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      return response.ok;
    } catch (err) {
      console.error('Error voting unhelpful:', err);
      return false;
    }
  };

  const getProductReviewStats = async (productId: string): Promise<ReviewStats | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${productId}/stats`
      );

      if (!response.ok) throw new Error('Failed to fetch review stats');

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching review stats:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchReviewableProducts();
    }
  }, [user?.token]);

  return {
    reviews,
    reviewableProducts,
    loading,
    error,
    fetchProductReviews,
    fetchReviewableProducts,
    createReview,
    voteHelpful,
    voteUnhelpful,
    getProductReviewStats,
  };
};