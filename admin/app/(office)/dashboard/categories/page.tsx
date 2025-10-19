'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { 
  FolderPlus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Folder, 
  Image as ImageIcon,
  Plus,
  AlertCircle,
  CheckCircle2,
  Upload,
  Hash,
  Info
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAlert } from '@/components/ui/Alert';

interface CategoryFormData {
  name: string;
  slug: string;
  imageUrl?: string;
}

function CategoryManagement() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useProducts();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    setValue('slug', generateSlug(name));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addAlert({
          type: 'error',
          title: 'Invalid File',
          message: 'Please select an image file (JPEG, PNG, WebP)',
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        addAlert({
          type: 'error',
          title: 'File Too Large',
          message: 'Image must be smaller than 5MB',
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      const categoryData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        imageUrl: imagePreview,
      };

      if (selectedFile) {
        categoryData.image = selectedFile;
      }

      if (editingId) {
        await updateCategory(editingId, categoryData);
        addAlert({
          type: 'success',
          title: 'Success!',
          message: 'Category updated successfully',
        });
        setEditingId(null);
      } else {
        await createCategory(categoryData);
        addAlert({
          type: 'success',
          title: 'Success!',
          message: 'Category created successfully',
        });
        setShowAddForm(false);
      }
      reset();
      clearImage();
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Operation failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category._id);
    setValue('name', category.name);
    setValue('slug', category.slug);
    if (category.imageUrl) {
      setImagePreview(category.imageUrl);
    }
    setShowAddForm(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"? This will also remove it from all associated products.`)) return;

    try {
      await deleteCategory(id);
      addAlert({
        type: 'success',
        title: 'Success!',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    reset();
    clearImage();
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingId(null);
    reset();
    clearImage();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Folder className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Categories
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage product categories and organization
              </p>
            </div>
          </div>
          
          {!showAddForm && !editingId && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="flex items-center space-x-3 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <FolderPlus className="w-5 h-5" />
              <span>Add Category</span>
            </motion.button>
          )}
        </motion.div>

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-xl">
                <FolderPlus className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Category Name *
                    </label>
                    <input
                      {...register('name', { 
                        required: 'Category name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                      })}
                      onChange={handleNameChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      placeholder="Electronics, Clothing, etc."
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      URL Slug *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('slug', { 
                          required: 'Slug is required',
                          pattern: {
                            value: /^[a-z0-9-]+$/,
                            message: 'Slug can only contain lowercase letters, numbers, and hyphens'
                          }
                        })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="electronics"
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.slug.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Info className="w-4 h-4" />
                      <span>URL-friendly identifier (auto-generated from name)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Category Image
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative w-full aspect-video border-2 border-gray-200 rounded-xl overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={clearImage}
                        className="absolute top-3 right-3 p-2 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-50 hover:border-red-300"
                      >
                        <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-blue-500" />
                      <p className="text-sm text-gray-500 group-hover:text-blue-600 text-center px-4">
                        Click to upload category image
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG, WebP • Max 5MB
                      </p>
                    </motion.label>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>
                    {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 shadow-sm"
            >
              <Folder className="w-20 h-20 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No categories yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Start organizing your products by creating your first category
              </p>
              {!showAddForm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNew}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <FolderPlus className="w-5 h-5" />
                  <span className="text-lg">Create First Category</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
              >
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Categories</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Folder className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">With Images</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {categories.filter(cat => cat.imageUrl).length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <ImageIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ready for Products</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                      editingId === category._id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 border-2 border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Folder className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Hash className="w-3 h-3" />
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded-lg">
                                {category.slug}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(category)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(category._id, category.name)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                          {category.imageUrl ? 'Has image' : 'No image'}
                        </span>
                        <button
                          onClick={() => router.push(`/dashboard/products?category=${category._id}`)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          View Products →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Call to Action */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to add products?
              </h3>
              <p className="text-gray-600 mb-6">
                Start adding products to your newly created categories
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/products/new')}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="text-lg">Add New Product</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function CategoryManagementPage() {
  return <CategoryManagement />;
}