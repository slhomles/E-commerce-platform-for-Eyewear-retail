import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const ReviewModal = ({ orderId, onClose, onSuccess }) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [selectedProductId, setSelectedProductId] = useState('');
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const data = await api.getOrderDetail(orderId);
                setOrderDetails(data);
                if (data && data.items && data.items.length > 0) {
                    setSelectedProductId(data.items[0].productId);
                }
            } catch (err) {
                setError('Không thể tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProductId) {
            setError('Vui lòng chọn sản phẩm để đánh giá.');
            return;
        }
        if (rating < 1 || rating > 5) {
            setError('Số sao phải từ 1 đến 5.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await api.addReview({
                orderId,
                productId: selectedProductId,
                rating,
                content
            });
            alert('Đánh giá của bạn đã được gửi thành công!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi gửi đánh giá.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={{ marginTop: 0 }}>Đánh giá sản phẩm</h3>

                {loading ? (
                    <p>Đang tải dữ liệu đơn hàng...</p>
                ) : error && !selectedProductId ? (
                    <div style={styles.error}>{error}</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div style={styles.error}>{error}</div>}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Chọn sản phẩm:</label>
                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                style={styles.select}
                                required
                            >
                                {orderDetails?.items?.map((item) => (
                                    <option key={item.id} value={item.productId}>
                                        {item.productName} ({item.quantity} cái)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Đánh giá số sao:</label>
                            <div style={styles.starContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        style={{
                                            ...styles.star,
                                            color: star <= rating ? '#fadb14' : '#e8e8e8'
                                        }}
                                        onClick={() => setRating(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nội dung nhận xét (tùy chọn):</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={styles.textarea}
                                placeholder="Sản phẩm dùng tốt không? Có đúng mô tả không?"
                                rows={4}
                            />
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                type="button"
                                className="button button-muted"
                                onClick={onClose}
                                disabled={submitting}
                                style={styles.cancelButton}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="button"
                                disabled={submitting || !selectedProductId}
                                style={styles.submitButton}
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    },
    modal: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    error: {
        backgroundColor: '#fee',
        color: '#d33',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    formGroup: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 600,
        color: '#333'
    },
    select: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        outline: 'none'
    },
    starContainer: {
        display: 'flex',
        gap: '8px',
        cursor: 'pointer'
    },
    star: {
        fontSize: '32px',
        transition: 'color 0.2s',
        userSelect: 'none'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        resize: 'vertical',
        outline: 'none'
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px'
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        color: '#333',
        border: '1px solid #d9d9d9',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    submitButton: {
        backgroundColor: '#1890ff',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default ReviewModal;
