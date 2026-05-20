import React, { useEffect, useState } from 'react';
import { useLocation, Link, useHistory } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import api from '@/services/api';

const PaymentSuccess = () => {
    useDocumentTitle('Payment Result | Glasses Store');
    useScrollTop();
    const location = useLocation();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Checking the payment result with the server...');
    const history = useHistory();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!location.search) {
                setStatus('error');
                setMessage('Payment information was not found.');
                return;
            }

            const params = new URLSearchParams(location.search);
            let verifyFn = null;
            let gateway = '';
            if (params.has('vnp_ResponseCode')) {
                verifyFn = api.verifyVNPay;
                gateway = 'VNPay';
            } else if (params.has('apptransid')) {
                verifyFn = api.verifyZaloPay;
                gateway = 'ZaloPay';
            } else if (params.has('partnerCode') || (params.has('orderId') && params.has('resultCode'))) {
                verifyFn = api.verifyMoMo;
                gateway = 'MoMo';
            } else if (params.has('code') && params.has('orderCode')) {
                verifyFn = api.verifyPayOS;
                gateway = 'PayOS';
            }

            if (!verifyFn) {
                setStatus('error');
                setMessage('The payment gateway could not be identified.');
                return;
            }

            try {
                const res = await verifyFn(location.search);
                if (res.status === 200) {
                    setStatus('success');
                    setMessage(res.data || 'Payment successful. Your order has been updated.');
                } else {
                    setStatus('error');
                    setMessage(res.message || `${gateway} payment verification failed.`);
                }
            } catch (error) {
                console.error(`${gateway} verification error:`, error);
                const backendMsg = error.data?.message || `${gateway} payment failed or was cancelled.`;
                setStatus('error');
                setMessage(backendMsg);
            }
        };

        verifyPayment();
    }, [location]);

    useEffect(() => {
        let timer;
        if (status === 'success') {
            timer = setTimeout(() => {
                history.push('/account?tab=orders');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [status, history]);

    return (
        <div className="checkout">
            <div className="checkout-step-3" style={{ textAlign: 'center', padding: '50px 20px' }}>
                {status === 'success' ? (
                    <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
                ) : (
                    <CloseCircleOutlined style={{ fontSize: '64px', color: '#f5222d' }} />
                )}
                
                <h2 style={{ marginTop: '20px' }}>{status === 'success' ? 'Thank you!' : 'Payment failed'}</h2>
                <p className="text-subtle" style={{ fontSize: '18px', margin: '20px 0' }}>{message}</p>
                
                <div style={{ marginTop: '40px' }}>
                    <Link to="/account?tab=orders" className="button">
                        View My Orders
                    </Link>
                    &nbsp;
                    <Link to="/shop" className="button button-muted">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
