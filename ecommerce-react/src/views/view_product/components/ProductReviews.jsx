import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? '#fadb14' : '#e8e8e8', fontSize: '18px' }}>★</span>
            );
        }
        return stars;
    };

    const roundedRating = averageRating ? averageRating.toFixed(1) : '0.0';

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Đánh giá sản phẩm</h2>

            <div style={styles.summaryContainer}>
                <div style={styles.averageScore}>
                    <span style={styles.scoreText}>{roundedRating}</span>
                    <br />
                    <span>trên 5</span>
                </div>
                <div style={styles.starsWrapper}>
                    {renderStars(Math.round(averageRating || 0))}
                    <div style={{ marginTop: '8px', color: '#666' }}>
                        ({reviewCount} đánh giá)
                    </div>
                </div>
            </div>

            <div style={styles.listContainer}>
                {loading && <p>Đang tải đánh giá...</p>}

                {!loading && reviews.length === 0 && (
                    <p style={{ color: '#888' }}>Chưa có đánh giá nào cho sản phẩm này.</p>
                )}

                {!loading && reviews.map((review) => (
                    <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.userInfo}>
                            <div style={styles.avatar}>
                                {review.userAvatar ? (
                                    <img src={review.userAvatar} alt={review.userFullName} style={styles.avatarImg} />
                                ) : (
                                    <span style={styles.avatarPlaceholder}>{review.userFullName?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div style={styles.userDetails}>
                                <div style={{ fontWeight: 600 }}>{review.userFullName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{renderStars(review.rating)}</span>
                                    {review.isVerifiedPurchase && (
                                        <span style={styles.verifiedBadge}>✓ Đã mua hàng</span>
                                    )}
                                </div>
                            </div>
                            <div style={styles.date}>{formatDate(review.createdAt)}</div>
                        </div>

                        <div style={styles.content}>
                            {review.content}
                        </div>

                        {review.images && review.images.length > 0 && (
                            <div style={styles.imagesGrid}>
                                {review.images.map((img, idx) => (
                                    <img key={idx} src={img} alt={`Review pic ${idx}`} style={styles.reviewImage} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        style={page === 0 ? styles.pageButtonDisabled : styles.pageButton}
                    >
                        ← Trước
                    </button>
                    <span style={{ padding: '0 16px', lineHeight: '36px' }}>Trang {page + 1} / {totalPages}</span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        style={page >= totalPages - 1 ? styles.pageButtonDisabled : styles.pageButton}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        marginTop: '40px',
        padding: '24px 0',
        borderTop: '1px solid #eee'
    },
    title: {
        marginBottom: '24px',
        fontSize: '24px'
    },
    summaryContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        padding: '24px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        marginBottom: '32px'
    },
    averageScore: {
        textAlign: 'center',
        color: '#d9534f'
    },
    scoreText: {
        fontSize: '36px',
        fontWeight: 'bold',
        lineHeight: 1
    },
    starsWrapper: {
        display: 'flex',
        flexDirection: 'column'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    reviewCard: {
        padding: '0 0 24px 0',
        borderBottom: '1px solid #eee'
    },
    userInfo: {
        display: 'flex',
        gap: '16px',
        marginBottom: '12px'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    avatarPlaceholder: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#999'
    },
    userDetails: {
        flex: 1
    },
    verifiedBadge: {
        fontSize: '12px',
        color: '#52c41a',
        backgroundColor: '#f6ffed',
        border: '1px solid #b7eb8f',
        padding: '0 8px',
        borderRadius: '4px'
    },
    date: {
        color: '#999',
        fontSize: '13px'
    },
    content: {
        fontSize: '15px',
        lineHeight: 1.6,
        color: '#333',
        marginBottom: '12px'
    },
    imagesGrid: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    reviewImage: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '32px'
    },
    pageButton: {
        padding: '8px 16px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    pageButtonDisabled: {
        padding: '8px 16px',
        border: '1px solid #eee',
        backgroundColor: '#fafafa',
        color: '#ccc',
        borderRadius: '4px',
        cursor: 'not-allowed'
    }
};

export default ProductReviews;
