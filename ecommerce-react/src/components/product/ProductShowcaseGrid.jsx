/* eslint-disable react/forbid-prop-types */
import { FeaturedProduct } from '@/components/product';
import PropType from 'prop-types';
import React from 'react';

const DEFAULT_PRICE_SETTINGS = { showOriginalPrice: true, showSalePrice: true, showDiscountBadge: true };

const ProductShowcase = ({ products, skeletonCount, priceSettings }) => {
  const ps = priceSettings || DEFAULT_PRICE_SETTINGS;

  return (
    <div className="product-display-grid">
      {(products.length === 0) ? new Array(skeletonCount).fill({}).map((product, index) => (
        <FeaturedProduct
          // eslint-disable-next-line react/no-array-index-key
          key={`product-skeleton ${index}`}
          product={product}
          priceSettings={ps}
        />
      )) : products.map((product) => (
        <FeaturedProduct
          key={product.id}
          product={product}
          priceSettings={ps}
        />
      ))}
    </div>
  );
};

ProductShowcase.defaultProps = {
  skeletonCount: 4,
  priceSettings: null,
};

ProductShowcase.propTypes = {
  products: PropType.array.isRequired,
  skeletonCount: PropType.number,
  priceSettings: PropType.shape({
    showOriginalPrice: PropType.bool,
    showSalePrice: PropType.bool,
    showDiscountBadge: PropType.bool,
  }),
};

export default ProductShowcase;
