import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS } from '@/constants/routes';
import {
  useDocumentTitle, useFeaturedProducts, useRecommendedProducts, useScrollTop
} from '@/hooks';
import HeroBannerCarousel from '@/components/common/HeroBannerCarousel';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const Home = () => {
  useDocumentTitle('Salinaka | Home');
  useScrollTop();

  const [homeFeaturedCount, setHomeFeaturedCount] = useState(6);
  const [homeRecommendedCount, setHomeRecommendedCount] = useState(6);

  useEffect(() => {
    api.getPublicSettings()
      .then((settingsList) => {
        settingsList.forEach((s) => {
          const val = parseInt(s.value, 10);
          if (!isNaN(val)) {
            if (s.key === 'home_featured_count') setHomeFeaturedCount(val);
            if (s.key === 'home_recommended_count') setHomeRecommendedCount(val);
          }
        });
      })
      .catch(() => {/* fallback default */});
  }, []);

  const {
    featuredProducts,
    fetchFeaturedProducts,
    isLoading: isLoadingFeatured,
    error: errorFeatured
  } = useFeaturedProducts(homeFeaturedCount);

  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading: isLoadingRecommended,
    error: errorRecommended
  } = useRecommendedProducts(homeRecommendedCount);

  return (
    <main className="content">
      <div className="home">
        <HeroBannerCarousel />
        <div className="display">
          <div className="display-header">
            <h1>Featured Products</h1>
            <Link to={FEATURED_PRODUCTS}>See All</Link>
          </div>
          {(errorFeatured && !isLoadingFeatured) ? (
            <MessageDisplay
              message={errorFeatured}
              action={fetchFeaturedProducts}
              buttonLabel="Try Again"
            />
          ) : (
            <ProductShowcaseGrid
              products={featuredProducts}
              skeletonCount={homeFeaturedCount}
            />
          )}
        </div>
        <div className="display">
          <div className="display-header">
            <h1>Recommended Products</h1>
            <Link to={RECOMMENDED_PRODUCTS}>See All</Link>
          </div>
          {(errorRecommended && !isLoadingRecommended) ? (
            <MessageDisplay
              message={errorRecommended}
              action={fetchRecommendedProducts}
              buttonLabel="Try Again"
            />
          ) : (
            <ProductShowcaseGrid
              products={recommendedProducts}
              skeletonCount={homeRecommendedCount}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
