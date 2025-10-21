import { HeroCarousel } from './HeroCarousel';
import { FeaturesSection } from './FeaturesSection';
import { CategoryScroll } from './CategoryScroll';

export const HeroSection: React.FC = () => {
  return (
    <div className="md:max-w-7xl md:m-auto">
      <HeroCarousel />
      <CategoryScroll />
      <FeaturesSection />
      {/* <RecentlyViewed /> */}
    </div>
  );
};