import React from 'react';
import { Link } from 'react-router-dom';

const formatPrice = (amount) => {
    if (amount == null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductCardInChat = ({ product }) => {
    return (
        <Link to={`/product/${product.id}`} className="chat-product-card">
            {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
            ) : (
                <div className="chat-product-card-img-placeholder">👓</div>
            )}
            <div className="chat-product-card-body">
                <p className="chat-product-name" title={product.name}>{product.name}</p>
                {product.brandName && (
                    <p className="chat-product-brand">{product.brandName}</p>
                )}
                <p className="chat-product-price">
                    {product.salePrice ? (
                        <>
                            <s>{formatPrice(product.basePrice)}</s>
                            {' '}{formatPrice(product.salePrice)}
                        </>
                    ) : (
                        formatPrice(product.basePrice)
                    )}
                </p>
            </div>
        </Link>
    );
};

export default ProductCardInChat;
