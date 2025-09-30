'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WishlistItem, WishlistContextType } from '@/types/wishlist';

interface WishlistState {
  wishlist: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Omit<WishlistItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

const initialState: WishlistState = {
  wishlist: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      // Check if item already exists in wishlist
      const existingItem = state.wishlist.find(
        item => item.productId === action.payload.productId
      );

      if (existingItem) {
        return state; // Item already in wishlist
      }

      const newItem: WishlistItem = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        addedAt: new Date().toISOString(),
      };

      return {
        wishlist: [...state.wishlist, newItem],
      };
    }

    case 'REMOVE_FROM_WISHLIST': {
      const newWishlist = state.wishlist.filter(
        item => item.productId !== action.payload
      );
      return {
        wishlist: newWishlist,
      };
    }

    case 'CLEAR_WISHLIST':
      return initialState;

    case 'LOAD_WISHLIST':
      return {
        wishlist: action.payload,
      };

    default:
      return state;
  }
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: wishlist });
      } catch (error) {
        console.error('Failed to load wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
  }, [state.wishlist]);

  const addToWishlist = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.wishlist.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const getWishlistCount = () => state.wishlist.length;

  const value: WishlistContextType = {
    wishlist: state.wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};