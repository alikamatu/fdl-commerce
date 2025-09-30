'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FolderPlus, Edit2, Trash2, Save, X, Folder } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAlert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Form/Input';

interface CategoryFormData {
  name: string;
  slug: string;
}

function CategoryManagement() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useProducts();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>();

  const nameValue = watch('name');

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

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, data);
        addAlert({
          type: 'success',
          title: 'Success!',
          message: 'Category updated successfully',
        });
        setEditingId(null);
      } else {
        await createCategory(data);
        addAlert({
          type: 'success',
          title: 'Success!',
          message: 'Category created successfully',
        });
        setShowAddForm(false);
      }
      reset();
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
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

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
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingId(null);
    reset();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-light tracking-tight flex items-center">
            <Folder className="w-8 h-8 mr-3" />
            Categories
          </h1>
          <p className="text-lg mt-2">
            Manage product categories for your store
          </p>
        </div>
        {!showAddForm && !editingId && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNew}
            className="flex items-center space-x-2 px-5 py-2.5 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Category</span>
          </motion.button>
        )}
      </motion.div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-none p-6 border"
        >
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Category Name"
              {...register('name', { required: 'Category name is required' })}
              error={errors.name?.message}
              placeholder="Electronics"
              onChange={handleNameChange}
            />
            
            <Input
              label="Slug"
              {...register('slug', { required: 'Slug is required' })}
              error={errors.slug?.message}
              placeholder="electronics"
              helperText="URL-friendly version (auto-generated)"
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}</span>
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
            className="rounded-none p-12 text-center border-2 border-dashed"
          >
            <Folder className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No categories yet
            </h3>
            <p className="mb-4">
              Create your first category to start organizing products
            </p>
            {!showAddForm && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Your First Category</span>
              </button>
            )}
          </motion.div>
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-none p-6 border transition-all ${
                editingId === category._id
                  ? 'border-current'
                  : 'border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 border rounded-none">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {category.name}
                    </h3>
                    <p className="text-sm">
                      Slug: <span className="font-mono">{category.slug}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(category._id)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Back to Products Button */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={() => router.push('/admin/products/add')}
            className="inline-flex items-center space-x-2 px-6 py-3 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Now Add Your First Product</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function CategoryManagementPage() {
  return (
      <CategoryManagement />
  );
}