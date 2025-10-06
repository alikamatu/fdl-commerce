import { Suspense } from "react";
import ProductPage from "./ProductPage";

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading products...</div>}>
      <ProductPage />
    </Suspense>
  );
}
