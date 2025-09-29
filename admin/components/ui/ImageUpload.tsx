'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onImageUpload: (file: File) => Promise<string>;
  maxImages?: number;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  onImageUpload, 
  maxImages = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      onImagesChange([...images, imageUrl]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Product Images
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Existing Images */}
        {images.map((url, index) => (
          <motion.div
            key={url}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <img
              src={url}
              alt={`Product image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors hover:border-blue-500 dark:hover:border-blue-400",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Upload</span>
              </>
            )}
          </motion.label>
        )}
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}