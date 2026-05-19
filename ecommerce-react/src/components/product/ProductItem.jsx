import { CheckOutlined } from '@ant-design/icons';
import { ImageLoader } from '@/components/common';
import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';

const ProductItem = ({ product, isItemOnBasket, addToBasket, priceSettings }) => {
  const history = useHistory();

  const onClickItem = () => {
    if (!product) return;
    if (product.id) history.push(`/product/${product.id}`);
  };

  const itemOnBasket = isItemOnBasket ? isItemOnBasket(product.id) : false;

  const handleAddToBasket = () => {
    if (addToBasket) addToBasket({
      ...product,
      selectedSize: product.sizes ? product.sizes[0] : '',
      selectedVariantId: product.variants?.[0]?.id || product.defaultVariantId
    });
  };

  const hasDiscount = product.basePrice && product.salePrice
    && Number(product.salePrice) < Number(product.basePrice);

  const discountPct = product.discountPercent
    || (hasDiscount
      ? Math.round((1 - Number(product.salePrice) / Number(product.basePrice)) * 100)
      : 0);

  // Nếu sản phẩm đã được cấu hình riêng → dùng per-product, global không ảnh hưởng
  // Ngược lại → dùng hoàn toàn global settings
  const overridden = product.priceDisplayOverridden === true;
  const showOriginalPrice = overridden ? product.showOriginalPrice !== false : priceSettings.showOriginalPrice;
  const showSalePrice = overridden ? product.showSalePrice !== false : priceSettings.showSalePrice;
  const showDiscountBadge = overridden ? product.showDiscountBadge !== false : priceSettings.showDiscountBadge;

  return (
    <SkeletonTheme color="#e1e1e1" highlightColor="#f2f2f2">
      <div
        className={`product-card ${!product.id ? 'product-loading' : ''}`}
        style={{
          border: product && itemOnBasket ? '1px solid #a6a5a5' : '',
          boxShadow: product && itemOnBasket ? '0 10px 15px rgba(0, 0, 0, .07)' : 'none'
        }}
      >
        {itemOnBasket && <CheckOutlined className="fa fa-check product-card-check" />}

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

        <div
          className="product-card-content"
          onClick={onClickItem}
          role="presentation"
        >
          <div className="product-card-img-wrapper">
            {product.image ? (
              <ImageLoader
                alt={product.name}
                className="product-card-img"
                src={product.image}
              />
            ) : <Skeleton width="100%" height="90%" />}

            {/* Price overlay - góc dưới bên phải của ảnh */}
            {product.price && (
              <div className="product-card-price-overlay">
                {showOriginalPrice ? (
                  <span>{displayMoney(product.basePrice || product.price)}</span>
                ) : (
                  <span style={{ color: hasDiscount ? '#fff' : '#fff' }}>
                    {showSalePrice
                      ? displayMoney(product.salePrice || product.price)
                      : displayMoney(product.price)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="product-details">
            <h5 className="product-card-name text-overflow-ellipsis margin-auto">
              {product.name || <Skeleton width={80} />}
            </h5>
            <p className="product-card-brand">
              {product.brand || <Skeleton width={60} />}
            </p>
          </div>
        </div>

        {product.id && (
          <button
            className={`product-card-button button-small button button-block ${itemOnBasket ? 'button-border button-border-gray' : ''}`}
            onClick={handleAddToBasket}
            type="button"
          >
            {itemOnBasket ? 'Remove from basket' : 'Add to basket'}
          </button>
        )}
      </div>
    </SkeletonTheme>
  );
};

ProductItem.defaultProps = {
  isItemOnBasket: undefined,
  addToBasket: undefined,
  priceSettings: { showOriginalPrice: true, showSalePrice: true, showDiscountBadge: true },
};

ProductItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  product: PropType.object.isRequired,
  isItemOnBasket: PropType.func,
  addToBasket: PropType.func,
  priceSettings: PropType.shape({
    showOriginalPrice: PropType.bool,
    showSalePrice: PropType.bool,
    showDiscountBadge: PropType.bool,
  }),
};

export default ProductItem;
