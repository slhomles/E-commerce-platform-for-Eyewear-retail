import { ArrowRightOutlined, ShopOutlined } from '@ant-design/icons';
import { BasketItem } from '@/components/basket';
import VoucherInput from '@/components/basket/VoucherInput';
import { CHECKOUT_STEP_2 } from '@/constants/routes';
import { displayMoney } from '@/helpers/utils';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { syncCartSuccess } from '@/redux/actions/cartActions';
import api from '@/services/api';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';

const OrderSummary = ({ basket, subtotal }) => {
  useDocumentTitle('Check Out Step 1 | Salinaka');
  useScrollTop();
  const dispatch = useDispatch();
  const history = useHistory();
  const { voucherCode, discountAmount } = useSelector((state) => state.cart);
  const [isSyncing, setIsSyncing] = useState(false);
  const onClickPrevious = () => history.push('/');

  const onClickNext = async () => {
    // Sync client basket to server cart before proceeding,
    // so the order only contains exactly the items the user selected.
    const items = basket
      .filter((p) => p.selectedVariantId)
      .map((p) => ({ variantId: p.selectedVariantId, quantity: p.quantity || 1 }));
    if (items.length === 0) return;
    setIsSyncing(true);
    try {
      const cartData = await api.replaceCart(items);
      dispatch(syncCartSuccess(cartData));
    } catch (e) {
      // Non-fatal: proceed anyway, order will use whatever is on the server
    } finally {
      setIsSyncing(false);
    }
    history.push(CHECKOUT_STEP_2);
  };

  const finalSubtotal = discountAmount > 0 ? subtotal - discountAmount : subtotal;

  return (
    <div className="checkout">
      <StepTracker current={1} />
      <div className="checkout-step-1">
        <h3 className="text-center">Order Summary</h3>
        <span className="d-block text-center">Review items in your basket.</span>
        <br />
        <div className="checkout-items">
          {basket.map((product) => (
            <BasketItem
              basket={basket}
              dispatch={dispatch}
              key={product.id}
              product={product}
            />
          ))}
        </div>
        <br />
        <VoucherInput basket={basket} />
        <br />
        <div className="basket-total text-right">
          <p className="basket-total-title">Subtotal:</p>
          <h2 className="basket-total-amount">{displayMoney(subtotal)}</h2>
        </div>
        {discountAmount > 0 && (
          <div className="basket-total text-right" style={{ marginTop: '4px' }}>
            <p className="basket-total-title" style={{ color: '#2e7d32' }}>Discount ({voucherCode}):</p>
            <h2 className="basket-total-amount" style={{ color: '#2e7d32' }}>-{displayMoney(discountAmount)}</h2>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="basket-total text-right" style={{ marginTop: '4px', borderTop: '1px solid #e0e0e0', paddingTop: '8px' }}>
            <p className="basket-total-title" style={{ fontWeight: 'bold' }}>Total:</p>
            <h2 className="basket-total-amount" style={{ color: '#e65100' }}>{displayMoney(finalSubtotal)}</h2>
          </div>
        )}
        <br />
        <div className="checkout-shipping-action">
          <button
            className="button button-muted"
            onClick={onClickPrevious}
            type="button"
          >
            <ShopOutlined />
            &nbsp;
            Continue Shopping
          </button>
          <button
            className="button"
            onClick={onClickNext}
            disabled={isSyncing}
            type="button"
          >
            {isSyncing ? 'Syncing...' : 'Next Step'}
            &nbsp;
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  basket: PropType.arrayOf(PropType.object).isRequired,
  subtotal: PropType.number.isRequired
};

export default withCheckout(OrderSummary);
