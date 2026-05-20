import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { serverApplyVoucher, serverRemoveVoucher, syncCartSuccess } from '@/redux/actions/cartActions';
import { CloseOutlined, GiftOutlined } from '@ant-design/icons';
import api from '@/services/api';

const resolveBasketVariantId = (item) => (
  item.selectedVariantId
  || item.variantId
  || item.productVariantId
  || item.selectedVariant?.id
  || item.variants?.[0]?.id
  || item.defaultVariantId
);

const VoucherInput = ({ basket = [] }) => {
  const dispatch = useDispatch();
  const { voucherCode, discountAmount } = useSelector((state) => state.cart);
  const [code, setCode] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  const basketSignature = basket
    .map((item) => `${resolveBasketVariantId(item) || ''}:${item.quantity || 1}`)
    .join('|');

  const syncServerCart = async () => {
    const items = basket
      .map((item) => ({ variantId: resolveBasketVariantId(item), quantity: item.quantity || 1 }))
      .filter((item) => item.variantId);

    if (items.length === 0) return;

    const cartData = await api.replaceCart(items);
    dispatch(syncCartSuccess(cartData));
  };

  useEffect(() => {
    let mounted = true;

    const loadAvailableVouchers = async () => {
      try {
        setIsLoadingVouchers(true);
        try {
          await syncServerCart();
        } catch (err) {
          // Continue with the server cart already stored for this user.
        }
        const vouchers = await api.getAvailableVouchers();
        if (mounted) {
          setAvailableVouchers(Array.isArray(vouchers) ? vouchers : []);
        }
      } catch (err) {
        if (mounted) {
          setAvailableVouchers([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingVouchers(false);
        }
      }
    };

    if (!voucherCode) {
      loadAvailableVouchers();
    }

    return () => {
      mounted = false;
    };
  }, [basketSignature, voucherCode]);

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      await syncServerCart();
    } catch (err) {
      // Applying still goes through the existing saga, which will surface any backend validation error.
    }
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

  const formatVoucherLabel = (voucher) => {
    const discount = voucher.discountType === 'PERCENTAGE'
      ? `${voucher.discountValue}%`
      : formatCurrency(voucher.discountValue);
    const estimated = voucher.estimatedDiscountAmount > 0
      ? ` - giảm ${formatCurrency(voucher.estimatedDiscountAmount)}`
      : '';
    return `${voucher.code} (${discount}${estimated})`;
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <select
            value=""
            onChange={(e) => {
              setCode(e.target.value);
            }}
            disabled={isLoadingVouchers || availableVouchers.length === 0}
            style={{
              flex: '0 1 280px',
              minWidth: '220px',
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '14px',
              color: availableVouchers.length === 0 ? '#9e9e9e' : '#333',
              background: '#fff'
            }}
            aria-label="Chọn voucher có thể dùng"
          >
            <option value="">
              {isLoadingVouchers
                ? 'Đang tải voucher...'
                : availableVouchers.length > 0
                  ? 'Chọn voucher có thể dùng'
                  : 'Không có voucher phù hợp'}
            </option>
            {availableVouchers.map((voucher) => (
              <option key={voucher.id || voucher.code} value={voucher.code}>
                {formatVoucherLabel(voucher)}
              </option>
            ))}
          </select>
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
