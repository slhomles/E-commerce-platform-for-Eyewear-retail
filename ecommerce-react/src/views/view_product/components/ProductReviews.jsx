import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

const StarIcon = ({ filled }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={filled ? '#f5a623' : 'none'}
        stroke={filled ? '#f5a623' : '#d0d0d0'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const renderStars = (rating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <svg
                key={i}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={i <= rating ? '#f5a623' : 'none'}
                stroke={i <= rating ? '#f5a623' : '#d0d0d0'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        );
    }
    return stars;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const ProductReviews = ({ productId, averageRating = 0, reviewCount = 0 }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getProductReviews(productId, page, 5);
            setReviews(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [productId, page]);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [fetchReviews, productId]);

    const roundedRating = averageRating ? averageRating.toFixed(1) : '0.0';

    return (
        <div className="reviews">
            <h2 className="reviews__title">Đánh giá sản phẩm</h2>

            <div className="reviews__summary">
                <div className="reviews__score">
                    <span className="reviews__score-number">{roundedRating}</span>
                    <span className="reviews__score-label">trên 5</span>
                </div>
                <div className="reviews__summary-right">
                    <div className="reviews__stars-row">
                        {renderStars(Math.round(averageRating || 0), 20)}
                    </div>
                    <span className="reviews__count">{reviewCount} đánh giá</span>
                </div>
            </div>

            <div className="reviews__list">
                {loading && (
                    <div className="reviews__loading">Đang tải đánh giá...</div>
                )}

                {!loading && reviews.length === 0 && (
                    <div className="reviews__empty">Chưa có đánh giá nào cho sản phẩm này.</div>
                )}

                {!loading && reviews.map((review) => (
                    <div key={review.id} className="reviews__card">
                        <div className="reviews__card-header">
                            <div className="reviews__avatar">
                                {review.userAvatar ? (
                                    <img src={review.userAvatar} alt={review.userFullName} className="reviews__avatar-img" />
                                ) : (
                                    <span className="reviews__avatar-placeholder">
                                        {review.userFullName?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="reviews__user-info">
                                <span className="reviews__user-name">{review.userFullName}</span>
                                <div className="reviews__meta">
                                    <div className="reviews__stars-row">
                                        {renderStars(review.rating, 14)}
                                    </div>
                                    {review.isVerifiedPurchase && (
                                        <span className="reviews__verified">
                                            ✓ Đã mua hàng
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="reviews__date">{formatDate(review.createdAt)}</span>
                        </div>

                        <p className="reviews__content">{review.content}</p>

                        {review.images && review.images.length > 0 && (
                            <div className="reviews__images">
                                {review.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Review ${idx + 1}`}
                                        className="reviews__image"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="reviews__pagination">
                    <button
                        className="reviews__page-btn"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        ← Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            className={`reviews__page-btn ${page === i ? 'reviews__page-btn--active' : ''}`}
                            onClick={() => setPage(i)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="reviews__page-btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
