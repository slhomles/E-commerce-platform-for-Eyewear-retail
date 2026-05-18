import { ImageLoader } from '@/components/common';
import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';

const ProductFeatured = ({ product, priceSettings }) => {
  const history = useHistory();
  const onClickItem = () => {
    if (!product) return;
    history.push(`/product/${product.id}`);
  };

  const hasDiscount = product.basePrice && product.salePrice
    && Number(product.salePrice) < Number(product.basePrice);

  const discountPct = product.discountPercent
    || (hasDiscount
      ? Math.round((1 - Number(product.salePrice) / Number(product.basePrice)) * 100)
      : 0);

  const overridden = product.priceDisplayOverridden === true;
  const showOriginalPrice = overridden ? product.showOriginalPrice !== false : priceSettings.showOriginalPrice;
  const showSalePrice = overridden ? product.showSalePrice !== false : priceSettings.showSalePrice;
  const showDiscountBadge = overridden ? product.showDiscountBadge !== false : priceSettings.showDiscountBadge;

  return (
    <SkeletonTheme color="#e1e1e1" highlightColor="#f2f2f2">
      <div className="product-display" onClick={onClickItem} role="presentation" style={{ position: 'relative' }}>

        {/* Discount badge */}
        {product.id && showDiscountBadge && hasDiscount && discountPct > 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#e53935',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 7px',
            borderRadius: '4px',
            letterSpacing: '.03em',
            zIndex: 2,
          }}>
            -{discountPct}%
          </div>
        )}

        <div className="product-display-img">
          {product.image ? (
            <ImageLoader
              className="product-card-img"
              src={product.image}
            />
          ) : <Skeleton width="100%" height="100%" />}
        </div>

        <div className="product-display-details">
          <h2>{product.name || <Skeleton width={80} />}</h2>
          <p className="text-subtle text-italic">
            {product.brand || <Skeleton width={40} />}
          </p>

          {/* Price block */}
          {product.price ? (
            <div style={{ marginTop: '6px' }}>
              {showOriginalPrice ? (
                /* Chế độ "Giá gốc": chỉ hiện basePrice */
                <p style={{ margin: '2px 0 0', fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>
                  {displayMoney(product.basePrice || product.price)}
                </p>
              ) : (
                <>
                  {showSalePrice && (
                    <p style={{
                      margin: '2px 0 0',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: hasDiscount ? '#e53935' : '#1a1a1a',
                    }}>
                      {displayMoney(product.salePrice || product.price)}
                    </p>
                  )}
                  {!showSalePrice && (
                    <p style={{ margin: '2px 0 0', fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>
                      {displayMoney(product.price)}
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <Skeleton width={60} />
          )}
        </div>
      </div>
    </SkeletonTheme>
  );
};

ProductFeatured.defaultProps = {
  priceSettings: { showOriginalPrice: true, showSalePrice: true, showDiscountBadge: true },
};

ProductFeatured.propTypes = {
  product: PropType.shape({
    image: PropType.string,
    name: PropType.string,
    id: PropType.string,
    brand: PropType.string,
    price: PropType.number,
    basePrice: PropType.number,
    salePrice: PropType.number,
    discountPercent: PropType.number,
  }).isRequired,
  priceSettings: PropType.shape({
    showOriginalPrice: PropType.bool,
    showSalePrice: PropType.bool,
    showDiscountBadge: PropType.bool,
  }),
};

export default ProductFeatured;
