import { useBasket } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import ProductItem from './ProductItem';

const DEFAULT_PRICE_SETTINGS = { showOriginalPrice: true, showSalePrice: true, showDiscountBadge: true };

const ProductGrid = ({ products, priceSettings }) => {
  const { addToBasket, isItemOnBasket } = useBasket();
  const ps = priceSettings || DEFAULT_PRICE_SETTINGS;

  return (
    <div className="product-grid">
      {products.length === 0 ? new Array(12).fill({}).map((product, index) => (
        <ProductItem
          // eslint-disable-next-line react/no-array-index-key
          key={`product-skeleton ${index}`}
          product={product}
          priceSettings={ps}
        />
      )) : products.map((product) => (
        <ProductItem
          key={product.id}
          isItemOnBasket={isItemOnBasket}
          addToBasket={addToBasket}
          product={product}
          priceSettings={ps}
        />
      ))}
    </div>
  );
};

ProductGrid.defaultProps = {
  priceSettings: null,
};

ProductGrid.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  products: PropType.array.isRequired,
  priceSettings: PropType.shape({
    showOriginalPrice: PropType.bool,
    showSalePrice: PropType.bool,
    showDiscountBadge: PropType.bool,
  }),
};

export default ProductGrid;
