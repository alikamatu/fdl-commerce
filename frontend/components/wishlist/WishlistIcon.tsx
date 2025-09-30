import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

interface WishlistIconProps {
  className?: string;
}

export const WishlistIcon: React.FC<WishlistIconProps> = ({ className = '' }) => {
  const { getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();

  return (
    <a href="/wishlist" className={`relative ${className}`}>
      <Heart size={24} className="text-foreground" />
      {wishlistCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
        >
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </motion.span>
      )}
    </a>
  );
};