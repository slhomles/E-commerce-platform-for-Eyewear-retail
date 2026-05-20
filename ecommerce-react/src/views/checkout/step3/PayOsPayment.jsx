import { Field } from 'formik';
import React from 'react';

/**
 * Component hiển thị lựa chọn thanh toán PayOS (VietQR)
 * Tương tự pattern của VNPayPayment.jsx đã có sẵn
 */
const PayOsPayment = () => (
  <div className="checkout-fieldset">
    <div className="checkout-field margin-0">
      <div className="checkout-input">
        <label className="payment-method" htmlFor="payos">
          <Field
            id="payos"
            name="type"
            type="radio"
            value="payos"
          />
          <div className="payment-method-info">
            {/* Logo VietQR + PayOS */}
            <div className="payment-method-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"
                alt="VietQR"
                style={{ height: '28px', objectFit: 'contain' }}
              />
              <span
                style={{
                  background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '13px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px'
                }}
              >
                PayOS
              </span>
            </div>

            <div className="payment-method-details">
              <span className="payment-method-name" style={{ fontWeight: '600', color: '#1a1a2e' }}>
                VietQR — Chuyển khoản ngân hàng
              </span>
              <p className="payment-method-desc" style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                Quét mã QR bằng ứng dụng ngân hàng bất kỳ. Thanh toán nhanh, an toàn, miễn phí.
              </p>

              {/* Danh sách ngân hàng hỗ trợ */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {['Vietcombank', 'Techcombank', 'MB Bank', 'VPBank', 'BIDV', 'Agribank'].map((bank) => (
                  <span
                    key={bank}
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      background: '#f0f7ff',
                      border: '1px solid #c2e0ff',
                      borderRadius: '4px',
                      color: '#0077b6',
                      fontWeight: '500'
                    }}
                  >
                    {bank}
                  </span>
                ))}
                <span style={{ fontSize: '11px', color: '#999', alignSelf: 'center' }}>& hơn 30 ngân hàng khác</span>
              </div>
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
);

export default PayOsPayment;
