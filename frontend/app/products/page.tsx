import { Suspense } from "react";
import ProductPage from "./ProductPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products - Forbes Digital Lifeline",
  description: "Browse our complete collection of tech products, electronics, and gadgets at Forbes Digital Lifeline. Find the latest devices and accessories.",
  keywords: ["products", "electronics", "gadgets", "tech accessories", "devices", "Forbes Digital Lifeline"],
};

export default function AllProductsPage() {
  return (
    <>
      <Suspense fallback={<div className="py-12 text-center">Loading products...</div>}>
        <ProductPage />
      </Suspense>
    </>
  );
}
