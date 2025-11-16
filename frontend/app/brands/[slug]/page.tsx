"use client";

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useBrands } from '@/hooks/useBrands';
import { BrandProducts } from '@/components/brands/BrandProducts';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = use(params);
  const { brands, loading, getBrandBySlug } = useBrands();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-foreground/10 rounded-full animate-pulse mx-auto mb-4" />
          <div className="h-6 bg-foreground/10 rounded w-32 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  return <BrandProducts brand={brand} />;
}