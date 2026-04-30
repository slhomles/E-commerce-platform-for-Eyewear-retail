import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { useDocumentTitle, useFeaturedProducts, useScrollTop } from '@/hooks';
import bannerImg from '@/images/banner-guy.png';
import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const FeaturedProducts = () => {
  useDocumentTitle('Featured Products | Salinaka');
  useScrollTop();

  const [featuredCount, setFeaturedCount] = useState(12);

  useEffect(() => {
    api.getPublicSettings()
      .then((settingsList) => {
        const s = settingsList.find((x) => x.key === 'featured_page_count');
        if (s) {
          const val = parseInt(s.value, 10);
          if (!isNaN(val)) setFeaturedCount(val);
        }
      })
      .catch(() => {});
  }, []);

  const {
    featuredProducts,
    fetchFeaturedProducts,
    isLoading,
    error
  } = useFeaturedProducts(featuredCount);

  return (
    <main className="content">
      <div className="featured">
        <div className="banner">
          <div className="banner-desc">
            <h1>Featured Products</h1>
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
                action={fetchFeaturedProducts}
                buttonLabel="Try Again"
              />
            ) : (
              <ProductShowcaseGrid
                products={featuredProducts}
                skeletonCount={featuredCount}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeaturedProducts;
