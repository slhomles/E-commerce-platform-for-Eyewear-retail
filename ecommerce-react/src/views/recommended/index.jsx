import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { useDocumentTitle, useRecommendedProducts, useScrollTop } from '@/hooks';
import bannerImg from '@/images/banner-girl-1.png';
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
    <main className="content">
      <div className="featured">
        <div className="banner">
          <div className="banner-desc">
            <h1>Recommended Products</h1>
          </div>
          <div className="banner-img">
            <img src={bannerImg} alt="" />
          </div>
        </div>
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
  );
};

export default RecommendedProducts;
