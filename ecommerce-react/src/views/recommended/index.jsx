import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { useDocumentTitle, useRecommendedProducts, useScrollTop } from '@/hooks';
import HeroBannerCarousel from '@/components/common/HeroBannerCarousel';
import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const RecommendedProducts = () => {
  useDocumentTitle('Recommended Products | Salinaka');
  useScrollTop();

  const [recommendedCount, setRecommendedCount] = useState(12);

  useEffect(() => {
    api.getPublicSettings()
      .then((settingsList) => {
        const s = settingsList.find((x) => x.key === 'recommended_page_count');
        if (s) {
          const val = parseInt(s.value, 10);
          if (!isNaN(val)) setRecommendedCount(val);
        }
      })
      .catch(() => {});
  }, []);

  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading,
    error
  } = useRecommendedProducts(recommendedCount);

  return (
    <>
      <HeroBannerCarousel location="RECOMMENDED" />
      <main className="content">
        <div className="featured">
          <div className="display">
            <div className="product-display-grid">
              {(error && !isLoading) ? (
                <MessageDisplay
                  message={error}
                  action={fetchRecommendedProducts}
                  buttonLabel="Try Again"
                />
              ) : (
                <ProductShowcaseGrid
                  products={recommendedProducts}
                  skeletonCount={recommendedCount}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default RecommendedProducts;
