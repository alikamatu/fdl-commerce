"use client";

import { CategoriesPage } from '@/components/categories/CategoriesPage';
import Head from 'next/head';

export default function Categories() {
  return (
    <>
      <Head>
        <title>Product Categories - Forbes Digital Lifeline</title>
        <meta name="description" content="Browse our wide range of product categories including electronics, gadgets, and tech accessories at Forbes Digital Lifeline." />
        <meta name="keywords" content="product categories, electronics, gadgets, tech accessories, Forbes Digital Lifeline" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/categories`} />
        <meta property="og:title" content="Product Categories - Forbes Digital Lifeline" />
        <meta property="og:description" content="Browse our wide range of product categories including electronics, gadgets, and tech accessories at Forbes Digital Lifeline." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Product Categories - Forbes Digital Lifeline" />
        <meta name="twitter:description" content="Browse our wide range of product categories including electronics, gadgets, and tech accessories at Forbes Digital Lifeline." />
      </Head>
      <CategoriesPage />
    </>
  );
}