import { HeroCarousel } from './HeroCarousel';
import { CategoryGrid } from './CategoryGrid';
import { FeaturesSection } from './FeaturesSection';
import { RecentlyViewed } from './RecentlyViewed';

export const HeroSection: React.FC = () => {
  return (
    <div className="w-full">
      <HeroCarousel />
      <CategoryGrid variant="scroll" />
      <FeaturesSection />
      {/* <RecentlyViewed /> */}
    </div>
  );
};