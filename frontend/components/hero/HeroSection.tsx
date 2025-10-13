import { HeroCarousel } from './HeroCarousel';
import { CategoryGrid } from './CategoryGrid';
import { FeaturesSection } from './FeaturesSection';
import { RecentlyViewed } from './RecentlyViewed';

export const HeroSection: React.FC = () => {
  return (
    <div className="md:max-w-7xl md:m-auto">
      <HeroCarousel />
      <CategoryGrid variant="scroll" />
      <FeaturesSection />
      {/* <RecentlyViewed /> */}
    </div>
  );
};