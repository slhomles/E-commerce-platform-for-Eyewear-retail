import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { serverApplyVoucher, serverRemoveVoucher } from '@/redux/actions/cartActions';
import { CloseOutlined, GiftOutlined } from '@ant-design/icons';

const VoucherInput = () => {
  const dispatch = useDispatch();
  const { voucherCode, discountAmount } = useSelector((state) => state.cart);
  const [code, setCode] = useState('');

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    dispatch(serverApplyVoucher(trimmed));
    setCode('');
  };

  const handleRemove = () => {
    dispatch(serverRemoveVoucher());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
      {voucherCode ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#e8f5e9',
          borderRadius: '6px',
          border: '1px solid #c8e6c9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GiftOutlined style={{ color: '#2e7d32', fontSize: '16px' }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2e7d32', letterSpacing: '1px' }}>
              {voucherCode}
            </span>
            {discountAmount > 0 && (
              <span style={{ color: '#e65100', fontWeight: 'bold' }}>
                -{formatCurrency(discountAmount)}
              </span>
            )}
          </div>
          <button
            onClick={handleRemove}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#c62828',
              fontSize: '14px',
              padding: '4px'
            }}
            title="Remove voucher"
          >
            <CloseOutlined />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <GiftOutlined style={{ color: '#757575', fontSize: '16px' }} />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter voucher code"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: '14px'
            }}
          />
          <button
            className="button button-small"
            onClick={handleApply}
            type="button"
            disabled={!code.trim()}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default VoucherInput;
