import { HeroSection } from "@/components/hero/HeroSection";
import Products from "@/components/products/Products";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <Products />
    </main>
  );
}