import { Suspense } from "react";
import { RecommendedProducts } from "@/components/products/RecommendedProducts";
import Products from "@/components/products/Products";
import { BrandsSection } from "@/components/brands/BrandsSection";
import { DealsSection } from "@/components/deals/DealsSection";
import { CategoryScroll } from "@/components/categories/CategoryScroll";
import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { FeaturesSection } from "@/components/hero/FeaturesSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <HeroCarousel />
      
      <CategoryScroll />
      
      <FeaturesSection />

      <Suspense fallback={<div className="py-12 text-center px-4">Loading products...</div>}>
        <Products />
      </Suspense>

      <BrandsSection />

      <Suspense fallback={<div className="py-12 text-center">Loading recommendations...</div>}>
        <RecommendedProducts 
          title="Latest Phones"
          category="690de60260cfb97993bc0a1c"
          limit={10}
          showViewAll={true}
        />
      </Suspense>

      <DealsSection 
        title="Today's Hot Deals"
        subtitle="Limited time offers with special discounts"
        limit={10}
        showViewAll={true}
      />
    </main>
  );
}
