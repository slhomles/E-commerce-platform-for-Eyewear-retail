import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import api from '@/services/api';

const PaymentSuccess = () => {
    useDocumentTitle('Kết quả thanh toán | Glasses Store');
    useScrollTop();
    const location = useLocation();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Đang kiểm tra kết quả thanh toán với máy chủ...');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!location.search) {
                setStatus('error');
                setMessage('Không tìm thấy thông tin URL VNPay.');
                return;
            }

            try {
                // Gọi API backend để check Sign và cập nhật DB (Order status)
                const res = await api.verifyVNPay(location.search);
                if (res.status === 200) {
                    setStatus('success');
                    setMessage(res.data || 'Thanh toán thành công! Đơn hàng của bạn đã được cập nhật.');
                } else {
                    setStatus('error');
                    setMessage(res.message || 'Xác thực thanh toán trên server thất bại.');
                }
            } catch (error) {
                console.error('Lỗi xác thực VNPay:', error);
                const query = new URLSearchParams(location.search);
                const vnpCode = query.get('vnp_ResponseCode');
                const backendMsg = error.data?.message || `Thanh toán thất bại (Mã lỗi VNPay: ${vnpCode || 'Hủy hoặc Không rõ'})`;
                
                setStatus('error');
                setMessage(backendMsg);
            }
        };

        verifyPayment();
    }, [location]);

    return (
        <div className="checkout">
            <div className="checkout-step-3" style={{ textAlign: 'center', padding: '50px 20px' }}>
                {status === 'success' ? (
                    <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
                ) : (
                    <CloseCircleOutlined style={{ fontSize: '64px', color: '#f5222d' }} />
                )}
                
                <h2 style={{ marginTop: '20px' }}>{status === 'success' ? 'Cảm ơn bạn!' : 'Rất tiếc!'}</h2>
                <p className="text-subtle" style={{ fontSize: '18px', margin: '20px 0' }}>{message}</p>
                
                <div style={{ marginTop: '40px' }}>
                    <Link to="/account" className="button">
                        Xem đơn hàng của tôi
                    </Link>
                    &nbsp;
                    <Link to="/shop" className="button button-muted">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
