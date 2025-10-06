import { HeroSection } from "@/components/hero/HeroSection";
import { RecommendedProducts } from "@/components/products/RecommendedProducts";
import Products from "@/components/products/Products";
import { BrandsSection } from "@/components/brands/BrandsSection";
import { DealsSection } from "@/components/deals/DealsSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* <HeroSection /> */}
      <Products />
      <BrandsSection />
      <RecommendedProducts 
        title="Top Laptops"
        category="68db0caee17cbcad34630451"
        limit={10}
        showViewAll={true}
      />
      <DealsSection 
        title="Today's Hot Deals"
        subtitle="Limited time offers with special discounts"
        limit={10}
        showViewAll={true}
      />
    </main>
  );
}